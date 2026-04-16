import boto3
iam = boto3.client('iam')
try:
    role = iam.get_role(RoleName='lambda-sqli-role')
    print("Trust Policy:", role['Role']['AssumeRolePolicyDocument'])
except Exception as e:
    print(e)
