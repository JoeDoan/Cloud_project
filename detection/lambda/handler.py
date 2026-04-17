import json, base64, boto3, os, datetime, re, uuid

SNS_TOPIC_ARN   = os.environ.get("SNS_TOPIC_ARN", "")
DYNAMODB_TABLE  = os.environ.get("DYNAMODB_TABLE", "sql-injection-findings")

sns      = boto3.client("sns", region_name="us-east-2")
dynamodb = boto3.resource("dynamodb", region_name="us-east-2")

SQLI_PATTERNS = [
    ("union_select",        re.compile(r'(?i)union\s+select'),                             'CRITICAL'),
    ("information_schema",  re.compile(r'(?i)information_schema'),                         'CRITICAL'),
    ("drop_table",          re.compile(r'(?i)drop\s+table'),                               'CRITICAL'),
    ("always_true_bypass",  re.compile(r"(?i)(\' ?or ?1 ?= ?1|\" ?or ?1 ?= ?1|or 1=1)"), 'HIGH'),
    ("sleep_delay",         re.compile(r'(?i)(sleep\s*\(|waitfor\s+delay)'),               'HIGH'),
    ("comment_injection",   re.compile(r"(--\s|#\s|/\*)"),                                 'MEDIUM'),
    ("hex_encoding",        re.compile(r'0x[0-9a-fA-F]{4,}'),                             'MEDIUM'),
    ("single_quote",        re.compile(r"['\"]\s*(;|--|#|\/\*)"),                          'LOW'),
]

SEVERITY_RANK = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}

def classify(uri, query):
    full_input = (uri or '') + '?' + (query or '')
    matches = []
    max_severity = "NONE"
    for name, pattern, severity in SQLI_PATTERNS:
        if pattern.search(full_input):
            matches.append({"pattern": name, "severity": severity})
            if SEVERITY_RANK.get(severity, 0) > SEVERITY_RANK.get(max_severity, 0):
                max_severity = severity
    return {"detected": len(matches) > 0, "severity": max_severity, "matches": matches}

def write_to_dynamodb(finding):
    try:
        table = dynamodb.Table(DYNAMODB_TABLE)
        # TTL: auto-expire after 7 days
        expiry = int((datetime.datetime.utcnow() + datetime.timedelta(days=7)).timestamp())
        table.put_item(Item={
            "id":         str(uuid.uuid4()),
            "timestamp":  finding["timestamp"],
            "source_ip":  finding["source_ip"],
            "uri":        finding["uri"],
            "query":      finding["query"],
            "severity":   finding["severity"],
            "patterns":   json.dumps(finding["patterns"]),
            "waf_action": finding["waf_action"],
            "expiry":     expiry
        })
    except Exception as e:
        print(f"[DynamoDB ERROR] {e}")

def lambda_handler(event, context):
    detections = []
    for record in event["Records"]:
        raw = base64.b64decode(record["kinesis"]["data"]).decode("utf-8")
        try:
            log = json.loads(raw)
        except json.JSONDecodeError:
            continue

        http_req   = log.get("httpRequest", {})
        uri        = http_req.get("uri", "")
        query      = http_req.get("args", "")
        source_ip  = http_req.get("clientIp", "unknown")
        waf_action = log.get("action", "ALLOW")

        result = classify(uri, query)

        if result["detected"]:
            finding = {
                "timestamp":  datetime.datetime.utcnow().isoformat(),
                "source_ip":  source_ip,
                "uri":        uri,
                "query":      query[:200],
                "severity":   result["severity"],
                "patterns":   result["matches"],
                "waf_action": waf_action
            }
            detections.append(finding)
            print(f"[DETECTION] {result['severity']} | {source_ip} | {uri}")

            # Write every detection to DynamoDB for the React dashboard
            write_to_dynamodb(finding)

            # Alert via SNS for HIGH/CRITICAL only
            if result["severity"] in ("HIGH", "CRITICAL") and SNS_TOPIC_ARN:
                sns.publish(
                    TopicArn=SNS_TOPIC_ARN,
                    Subject=f"[{result['severity']}] SQL Injection Detected — {source_ip}",
                    Message=json.dumps(finding, indent=2)
                )

    print(f"Processed {len(event['Records'])} records, {len(detections)} detections")
    return {"statusCode": 200, "detections": len(detections)}
