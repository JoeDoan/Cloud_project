resource "aws_dynamodb_table" "sqli_findings" {
  name         = "sql-injection-findings"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "timestamp"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  # Auto-delete records older than 7 days
  ttl {
    attribute_name = "expiry"
    enabled        = true
  }

  tags = {
    Project = "sqli-detection"
  }
}

# Lookup the existing Lambda execution role (deployed by Person 3)
data "aws_iam_role" "lambda_exec" {
  name = "sql-injection-detector-role-d8rblgsr"
}

# Allow Lambda to write findings into DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "lambda_dynamodb_write_policy"
  role = data.aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.sqli_findings.arn
      }
    ]
  })
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.sqli_findings.name
}

output "dynamodb_table_arn" {
  value = aws_dynamodb_table.sqli_findings.arn
}
