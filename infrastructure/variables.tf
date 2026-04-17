variable "aws_region" {
  type    = string
  default = "us-east-2"
}

variable "target_ec2_ip" {
  description = "The public IP alias of Person 1's EC2 target running the vulnerable app"
  type        = string
  default     = "3.144.240.191"
}

variable "kinesis_firehose_arn" {
  description = "The ARN of the Kinesis Firehose stream created by Person 4 for WAF logs"
  type        = string
  default     = "arn:aws:firehose:us-east-2:867490540204:deliverystream/aws-waf-logs-sqli-logs-to-s3"
}

variable "team_email_1" {
  description = "Email address for Person 1"
  type        = string
  default     = "person1@example.com"
}

variable "team_email_2" {
  description = "Email address for Person 2"
  type        = string
  default     = "person2@example.com"
}

variable "team_email_3" {
  description = "Email address for Person 3"
  type        = string
  default     = "person3@example.com"
}

variable "team_email_4" {
  description = "Email address for Person 4"
  type        = string
  default     = "person4@example.com"
}

variable "team_email_5" {
  description = "Email address for Person 5"
  type        = string
  default     = "person5@example.com"
}
