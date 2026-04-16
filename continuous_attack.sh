#!/bin/bash
echo "Painting the CloudWatch graphs with continuous simulated traffic for 2 minutes..."
end=$((SECONDS+120))
while [ $SECONDS -lt $end ]; do
  curl -s -H "x-api-key: wkmcS7Qk1t9Z2R1S79pZN3NLHvvcs8zY2s8QX4uo" "https://2y68q1dt27.execute-api.us-east-2.amazonaws.com/prod/search?name=test%27%20UNION%20SELECT%201,2,3--" > /dev/null
  curl -s -H "x-api-key: wkmcS7Qk1t9Z2R1S79pZN3NLHvvcs8zY2s8QX4uo" "https://2y68q1dt27.execute-api.us-east-2.amazonaws.com/prod/search?name=test%27%20SLEEP(10)--" > /dev/null
  curl -s -H "x-api-key: wkmcS7Qk1t9Z2R1S79pZN3NLHvvcs8zY2s8QX4uo" "https://2y68q1dt27.execute-api.us-east-2.amazonaws.com/prod/search?name=test" > /dev/null
  sleep 0.5
done
echo "Attack simulation complete."
