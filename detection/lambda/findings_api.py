"""
API Lambda — serves recent DynamoDB findings to the React dashboard.
Deploy this as a separate Lambda function with a Function URL or via API Gateway GET /findings.
"""
import json, boto3, os
from boto3.dynamodb.conditions import Key

TABLE_NAME = os.environ.get("DYNAMODB_TABLE", "sql-injection-findings")
dynamodb   = boto3.resource("dynamodb", region_name="us-east-2")

def lambda_handler(event, context):
    table = dynamodb.Table(TABLE_NAME)

    # Full scan — table is small (<1000 rows with 7-day TTL)
    resp = table.scan(Limit=200)
    items = resp.get("Items", [])

    # Sort newest first
    items.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    items = items[:100]

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",   # Required for React fetch
        },
        "body": json.dumps({"findings": items}, default=str)
    }
