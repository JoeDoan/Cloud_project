import boto3, json, time
iam = boto3.client('iam')
lambda_client = boto3.client('lambda', region_name='us-east-2')

role_name = 'lambda-sqli-role'
try:
    iam.get_role(RoleName=role_name)
except iam.exceptions.NoSuchEntityException:
    print("Person 3 forgot the IAM role! Creating it now...")
    trust_policy = {
        "Version": "2012-10-17",
        "Statement": [{"Action": "sts:AssumeRole", "Principal": {"Service": "lambda.amazonaws.com"}, "Effect": "Allow", "Sid": ""}]
    }
    iam.create_role(RoleName=role_name, AssumeRolePolicyDocument=json.dumps(trust_policy))
    iam.attach_role_policy(RoleName=role_name, PolicyArn='arn:aws:iam::aws:policy/service-role/AWSLambdaKinesisExecutionRole')
    iam.attach_role_policy(RoleName=role_name, PolicyArn='arn:aws:iam::aws:policy/AmazonSNSFullAccess')
    iam.attach_role_policy(RoleName=role_name, PolicyArn='arn:aws:iam::aws:policy/CloudWatchLogsFullAccess')
    print("Role created. Waiting for IAM replication...")
    time.sleep(10)

with open('sqli-detector.zip', 'rb') as f:
    zip_bytes = f.read()

print("Deploying Lambda function to Ohio (us-east-2)...")
for _ in range(5):
    try:
        response = lambda_client.create_function(
            FunctionName='sqli-detector', Runtime='python3.11', Role='arn:aws:iam::867490540204:role/lambda-sqli-role',
            Handler='handler.lambda_handler', Code={'ZipFile': zip_bytes}, Timeout=60, MemorySize=256
        )
        print("Success! Lambda ARN:", response['FunctionArn'])
        break
    except lambda_client.exceptions.ResourceConflictException:
        lambda_client.update_function_code(FunctionName='sqli-detector', ZipFile=zip_bytes)
        print("Updated existing function.")
        break
    except Exception as e:
        if "cannot be assumed by Lambda" in str(e):
            print("IAM not fully propagated yet, waiting 5 seconds...")
            time.sleep(5)
        else:
            print(f"Failed: {e}")
            break
