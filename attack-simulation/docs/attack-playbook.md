# Attack Playbook

## SQL Injection Overview
SQL Injection is a web application vulnerability where attackers insert malicious SQL code into application inputs. If the application directly includes that input in a database query, the attacker can manipulate the database query and access unauthorized data.

## Why It Happens
SQL Injection happens when:
- user input is not validated
- input is not sanitized
- raw SQL strings are built using concatenation
- parameterized queries are not used

In this project, the vulnerable Flask application used direct string concatenation in both `/login` and `/search`.

## Attack Type 1: Union-Based SQL Injection
Description:
Union-based SQL injection uses the SQL UNION operator to combine the original query with an attacker-controlled query and return extra data.

How it worked:
The `/search` endpoint accepted user input and directly inserted it into a SQL LIKE query. SQLMap exploited this behavior and dumped the table contents.

Data exposed:
- full_name
- email
- ssn
- credit_card
- dob

Risk:
This attack allows direct extraction of confidential data from the database.

## Attack Type 2: Boolean-Based Blind SQL Injection
Description:
Boolean-based blind SQL injection works by sending conditions that evaluate to true or false and observing the application response.

How it worked:
The `/login` endpoint directly concatenated user input into the SQL query. SQLMap used true/false conditions to infer the contents of the `users` table.

Data exposed:
- usernames
- emails
- ssn
- other user records

Risk:
Even when the application does not directly return the data, attackers can still reconstruct sensitive information.

## Attack Type 3: Error-Based SQL Injection
Description:
Error-based SQL injection uses database error behavior or error messages to reveal information about the database and query structure.

How it worked:
SQLMap targeted the vulnerable `/login` endpoint and used error-based behavior to extract data and database structure.

Data exposed:
- table contents
- database details
- internal query behavior

Risk:
This can reveal technical details and speed up exploitation.

## Manual Injection Tests

Login bypass:
http://3.144.240.191:5000/login?username=admin'--&password=x

UNION extraction:
http://3.144.240.191:5000/search?name=' UNION SELECT id,full_name,ssn FROM users--

Table enumeration:
http://3.144.240.191:5000/search?name=' UNION SELECT 1,table_name,3 FROM information_schema.tables--

Time delay test:
http://3.144.240.191:5000/login?username=admin' AND SLEEP(5)--&password=x

## Business Impact
Successful SQL injection can lead to:
- personal data exposure
- unauthorized access
- financial fraud
- compliance violations
- database compromise

## Prevention
- use parameterized queries
- avoid string concatenation in SQL
- validate all inputs
- restrict database privileges
- monitor suspicious requests
- deploy WAF protections
