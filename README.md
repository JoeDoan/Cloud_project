# 🛡️ Detecting Data Leaks via SQL Injection on AWS

A cloud-native, end-to-end SQL injection detection and response system built on **14 AWS services**. The system simulates realistic attacks against a deliberately vulnerable web application, blocks them at the network perimeter, detects obfuscated payloads that bypass WAF using a custom serverless classifier, and surfaces findings on a real-time dashboard with automated alerting.

> **UMKC — Cloud Computing Course Project (Spring 2026)**

[![Live Dashboard](https://img.shields.io/badge/Dashboard-LIVE-22c55e?style=for-the-badge)](https://main.dpgownrmhz6a9.amplifyapp.com/)
[![Demo Video](https://img.shields.io/badge/Demo-Video-EA4335?style=for-the-badge&logo=youtube)](https://umsystem.hosted.panopto.com/Panopto/Pages/Viewer.aspx?id=411ff7ff-9afc-48b3-8636-b4350022ccc5)
[![AWS](https://img.shields.io/badge/AWS-14%20Services-FF9900?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC?style=for-the-badge&logo=terraform)](https://www.terraform.io/)

---

## Key Results

| Metric | Value |
|--------|-------|
| **WAF Block Rate** | 94% of all detected attacks |
| **Overall Detection Rate** | ~100% (WAF + Lambda combined) |
| **Detection Latency** | < 30 seconds end-to-end |
| **Classification Patterns** | 8 regex patterns across 4 severity levels |
| **CIS Benchmark Compliance** | 87% |
| **Infrastructure Cost** | ~$5–10/month |
| **Deployment Time** | ~5 minutes via `terraform apply` |

### Research Highlight — Dual-Layer Detection Gap

AWS WAF blocks **94%** of standard SQL injection payloads. However, **6% of attacks bypass WAF** through URL encoding and obfuscation techniques (e.g., `%4F%52%20%31%3D%31` → `OR 1=1`). Our custom Lambda classifier URL-decodes payloads before applying regex patterns, successfully catching these evasive payloads. This demonstrates that **managed WAF rules alone are insufficient** — a secondary serverless detection layer significantly improves coverage.

---

## Architecture

```
                        ┌─────────────────────────────────────────────────────────┐
                        │                    AWS Cloud (us-east-2)                │
                        │                                                         │
  ┌────────────┐        │  ┌──────────────┐    ┌───────────┐    ┌──────────────┐  │
  │ Attacker   │───────►│  │ API Gateway  │───►│  AWS WAF  │───►│  Flask App   │  │
  │ EC2        │        │  │ + API Key    │    │  3 Rules  │    │  EC2         │  │
  │ (SQLMap)   │        │  │ + Throttle   │    │           │    │  (Vulnerable)│  │
  └────────────┘        │  └──────────────┘    └─────┬─────┘    └──────┬───────┘  │
                        │                            │                 │          │
                        │                    Logs ALL traffic    ┌─────▼──────┐   │
                        │                            │           │ RDS MySQL  │   │
                        │                   ┌────────▼────────┐  │ (20 users) │   │
                        │                   │ CloudWatch Logs  │  └────────────┘   │
                        │                   └────────┬────────┘                    │
                        │                            │ Subscription Filter         │
                        │                   ┌────────▼────────┐                    │
                        │                   │ Kinesis Stream   │                   │
                        │                   │ (2 shards)       │                   │
                        │                   └───┬─────────┬────┘                   │
                        │                       │         │                        │
                        │              ┌────────▼───┐ ┌───▼──────────┐             │
                        │              │ Lambda     │ │ Firehose     │             │
                        │              │ sqli-      │ │ → S3 Archive │             │
                        │              │ detector   │ │   (Glacier)  │             │
                        │              └──┬─────┬───┘ └──────────────┘             │
                        │                 │     │                                   │
                        │        ┌────────▼┐  ┌─▼──────────┐                       │
                        │        │DynamoDB │  │ SNS Topic  │                       │
                        │        │findings │  │ → 5 Emails │                       │
                        │        └────┬────┘  └────────────┘                       │
                        │             │                                            │
                        │     ┌───────▼───────┐    ┌──────────────┐                │
                        │     │ Lambda        │    │ Security Hub │                │
                        │     │ findings-api  │    │ CIS 87%      │                │
                        │     └───────┬───────┘    └──────┬───────┘                │
                        │             │                   │                        │
                        │     ┌───────▼───────────────────▼───────┐                │
                        │     │     React Dashboard (Amplify)     │                │
                        │     │     Polls every 10 seconds        │                │
                        │     └───────────────────────────────────┘                │
                        └─────────────────────────────────────────────────────────┘
```

**Data Flow:** Attack → API Gateway → WAF (Block/Allow) → CloudWatch → Kinesis → Lambda (Classify) → DynamoDB + SNS → Dashboard

---

## Project Layers

| Layer | Owner | Description | AWS Services |
|-------|-------|-------------|-------------|
| **1. Attack Simulation** | Bhavya Chennu | Vulnerable Flask app + SQLMap attacks | EC2 (×2), RDS MySQL |
| **2. Network Defense** | Joe Doan | Perimeter blocking + rate limiting | WAF v2, API Gateway, Shield, VPC Flow Logs |
| **3. Detection Engine** | Geethika Padamati | Real-time payload classification | Lambda (Python 3.12) |
| **4. Logging Pipeline** | Tony Nguyen | Stream processing + archival | Kinesis, Firehose, CloudWatch, S3 |
| **5. Alerting & Dashboard** | Tina Nguyen | Visualization + compliance | SNS, Amplify, DynamoDB, Security Hub |

---

## Detection Engine — 8 Custom Patterns

The Lambda classifier applies compiled regex patterns to URL-decoded payloads, catching attacks that bypass WAF's managed rules:

| Pattern | Regex | Severity | Detects |
|---------|-------|----------|---------|
| `union_select` | `(?i)union\s+select` | CRITICAL | Data exfiltration |
| `information_schema` | `(?i)information_schema` | CRITICAL | Database reconnaissance |
| `drop_table` | `(?i)drop\s+table` | CRITICAL | Data destruction |
| `always_true_bypass` | `(?i)(' or 1=1\|" or 1=1)` | HIGH | Authentication bypass |
| `sleep_delay` | `(?i)(sleep\s*\(\|waitfor)` | HIGH | Time-based blind SQLi |
| `comment_injection` | `(--\|#\s\|/\*)` | MEDIUM | Payload termination |
| `hex_encoding` | `0x[0-9a-fA-F]{4,}` | MEDIUM | WAF evasion via encoding |
| `single_quote` | `['"]\s*(;\|--\|#\|/\*)` | LOW | Basic injection probing |

**Key differentiator:** The Lambda applies `urllib.parse.unquote_plus()` before pattern matching, decoding percent-encoded payloads that WAF evaluates in raw form. This is why Lambda catches the 6% of attacks that WAF misses.

---

## WAF Configuration — 3 Rules

| Priority | Rule | Type | Action |
|----------|------|------|--------|
| 1 | `AWSManagedRulesSQLiRuleSet` | AWS Managed | Block known SQLi patterns |
| 2 | `AWSManagedRulesKnownBadInputsRuleSet` | AWS Managed | Block known exploits (Log4j, etc.) |
| 3 | `sqli-rate-limit` | Custom | Block IPs exceeding 100 req/5 min |

---

## Live Dashboard

**URL:** [https://main.dpgownrmhz6a9.amplifyapp.com/](https://main.dpgownrmhz6a9.amplifyapp.com/)

The React dashboard (deployed on AWS Amplify) polls the findings API every 10 seconds and displays:

- **KPI Bar** — Total Detections, Critical, High, Blocked counts
- **Live Attack Feed** — Real-time scrolling list with source IP, URI, and severity
- **Attack Type Breakdown** — Bar chart of pattern distribution across all findings
- **Blocked vs Allowed** — Pie chart showing WAF block rate
- **Security Hub Score** — 87% CIS Benchmark compliance

---

## Demo Video

🎬 **[Watch the full live demo on Panopto](https://umsystem.hosted.panopto.com/Panopto/Pages/Viewer.aspx?id=411ff7ff-9afc-48b3-8636-b4350022ccc5)**

The demo covers:
1. **Normal request** — showing the vulnerable Flask app responding to clean queries
2. **SQLMap attack without WAF** — full database dump (SSNs, credit cards) in under 2 minutes
3. **SQLMap attack with WAF** — every injection attempt blocked with 403 Forbidden
4. **Real-time dashboard** — live detection feed updating as attacks are classified
5. **SNS email alerts** — automated notifications on HIGH/CRITICAL findings

---

## S3 Lifecycle — Log Archival

| Age | Storage Class | Purpose |
|-----|--------------|---------|
| 0–30 days | S3 Standard | Active analysis |
| 30–90 days | S3 Standard-IA | Infrequent access |
| 90–365 days | S3 Glacier | Long-term forensics |
| > 365 days | Deleted | Cost optimization |

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| Vulnerable Web App | Python Flask + MySQL |
| Attack Tools | SQLMap |
| Detection Logic | Python 3.12 Lambda + `re` + `boto3` |
| Stream Processing | Kinesis Data Streams (2 shards) |
| Dashboard Frontend | React + Chart.js |
| Dashboard Hosting | AWS Amplify (auto-deploy from GitHub) |
| Database | DynamoDB (findings, 7-day TTL) + RDS MySQL (target app) |
| Alerting | SNS (email to 5 team members) |
| Compliance | AWS Security Hub (CIS Benchmark v1.4) |
| Infrastructure as Code | Terraform (not an AWS service) |

---

## Project Structure

```
├── attack-simulation/
│   ├── vulnerable-app/          # Flask app with intentional SQLi vulnerability
│   │   └── app.py               # String-concatenated SQL queries
│   └── attack-scripts/
│       └── run-attacks.sh        # SQLMap attack automation
├── dashboard/
│   └── src/
│       ├── App.jsx               # Main dashboard with KPI bar
│       └── components/
│           ├── LiveFeed.jsx      # Real-time attack feed
│           ├── AttackTypeChart.jsx # Pattern distribution bar chart
│           ├── BlockedPieChart.jsx # WAF block rate visualization
│           └── SecurityScore.jsx  # CIS benchmark display
├── detection/
│   └── lambda/
│       ├── handler.py            # sqli-detector: 8-pattern classifier
│       └── findings_api.py       # findings-api: DynamoDB → JSON endpoint
├── infrastructure/
│   ├── api_gateway.tf            # API Gateway + API key + throttling
│   ├── waf.tf                    # WAF v2 with 3 rules
│   ├── cloudwatch.tf             # Log groups + metric filters + alarms
│   ├── kinesis.tf                # Data stream + Firehose + S3
│   ├── dynamodb.tf               # Findings table + IAM policies
│   ├── sns.tf                    # Alert topic + 5 email subscriptions
│   └── s3.tf                     # Archive bucket + lifecycle policy
└── tasks/
    ├── project_report.md         # Full technical report
    └── Project_Flow_QA_Prep.html # Architecture & Q&A guide
```

---

## Quick Start — Deployment

### Prerequisites
- AWS CLI configured with `us-east-2` region
- Terraform >= 1.0
- Node.js >= 18 (for dashboard)

### Infrastructure
```bash
cd infrastructure
terraform init
terraform apply
```

### Dashboard (Local Dev)
```bash
cd dashboard
npm install
npm start
```

### Run Attacks (from Attacker EC2)
```bash
# Without WAF — direct to Flask
cd ~/sqlmap
python3 sqlmap.py -u "http://<flask-ec2-ip>:5000/search?name=test" --dbs --dump --batch

# With WAF — through API Gateway
curl -s -H "x-api-key: <your-api-key>" \
  "https://<api-gateway-url>/prod/search?name=test' UNION SELECT 1,2,3--"
```

---

## Future Work

- **ML-based detection** — Replace regex with a SageMaker-trained model for obfuscated payload detection
- **Automated remediation** — Lambda adds attacker IP to WAF blocklist on CRITICAL events
- **Benchmark evaluation** — Test against OWASP SQLi payload datasets for precision/recall metrics
- **Multi-region deployment** — Extend to cross-region WAF with CloudFront integration

---

## License

This project was developed for academic purposes at the University of Missouri–Kansas City (UMKC), Spring 2026.
