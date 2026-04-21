"""
API Lambda — serves recent DynamoDB findings to the React dashboard.
Deploy this as a separate Lambda function with a Function URL or via API Gateway GET /findings.
"""
import json, boto3, os
from boto3.dynamodb.conditions import Key

TABLE_NAME = os.environ.get("DYNAMODB_TABLE", "sql-injection-findings")
dynamodb   = boto3.resource("dynamodb", region_name="us-east-2")

MAX_ITEMS = 10000  # Maximum items to retrieve from DynamoDB

def lambda_handler(event, context):
    table = dynamodb.Table(TABLE_NAME)

    # Paginated scan — retrieves ALL items (DynamoDB returns max 1MB per call)
    items = []
    scan_kwargs = {}
    while len(items) < MAX_ITEMS:
        resp = table.scan(**scan_kwargs)
        items.extend(resp.get("Items", []))
        # If there are more pages, continue scanning
        if "LastEvaluatedKey" in resp:
            scan_kwargs["ExclusiveStartKey"] = resp["LastEvaluatedKey"]
        else:
            break

    # Sort newest first
    items.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

    # Compute summary stats from ALL items (not just the displayed 200)
    summary = {
        "totalCount":    len(items),
        "criticalCount": sum(1 for i in items if i.get("severity") == "CRITICAL"),
        "highCount":     sum(1 for i in items if i.get("severity") == "HIGH"),
        "mediumCount":   sum(1 for i in items if i.get("severity") == "MEDIUM"),
        "blockedCount":  sum(1 for i in items if i.get("waf_action") == "BLOCK"),
        "allowedCount":  sum(1 for i in items if i.get("waf_action") == "ALLOW"),
    }

    # Return up to 200 most recent findings + accurate summary counts
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",   # Required for React fetch
        },
        "body": json.dumps({
            "findings": items[:200],
            "summary": summary
        }, default=str)
    }

