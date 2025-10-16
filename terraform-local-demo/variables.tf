
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "aws_access_key_id" {
  description = "AWS access key ID"
  type        = string
  default     = "test"
}

variable "aws_secret_access_key" {
  description = "AWS secret access key"
  type        = string
  default     = "test"
}

variable "dynamodb_endpoint" {
  description = "DynamoDB endpoint URL for LocalStack"
  type        = string
  default     = "http://localhost:4566"
}

variable "table_name" {
  description = "El nombre deseado para la tabla de DynamoDB."
  type        = string
  default     = "comentarios"  # ✅ Cambiar de "ComentariosApp" a "comentarios"
}

variable "environment" {
  description = "El entorno de despliegue (e.g., dev, prod)."
  type        = string
  default     = "development"
}