import boto3
client = boto3.client('lambda', region_name='us-east-2')

with open('sqli-detector.zip', 'rb') as f:
    zip_bytes = f.read()

try:
    response = client.create_function(
        FunctionName='sqli-detector',
        Runtime='python3.11',
        Role='arn:aws:iam::867490540204:role/lambda-sqli-role',
        Handler='handler.lambda_handler',
        Code={'ZipFile': zip_bytes},
        Timeout=60,
        MemorySize=256,
        Environment={'Variables': {'SNS_TOPIC_ARN': 'arn:aws:sns:us-east-1:867490540204:sqli-attack-alerts'}}
    )
    print("Deployed new Lambda function to us-east-2:", response['FunctionArn'])
except client.exceptions.ResourceConflictException:
    print("Function already exists in us-east-2. Updating code...")
    client.update_function_code(FunctionName='sqli-detector', ZipFile=zip_bytes)
    print("Update complete.")
except Exception as e:
    print(f"Failed: {e}")
