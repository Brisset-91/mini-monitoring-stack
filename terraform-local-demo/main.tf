
# 1. Requerimientos de Terraform/Provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configuración del provider para LocalStack
provider "aws" {
  access_key                  = "test"
  secret_key                  = "test"
  region                      = "us-east-1"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    dynamodb = "http://localhost:4566"
  }
}

# Tabla de DynamoDB para Comentarios
resource "aws_dynamodb_table" "comentarios" {
  name           = var.table_name # Usa la variable definida en variables.tf
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  
  attribute {
    name = "id"
    type = "S"
  }

  # Índice secundario global para ordenar por fecha
  attribute {
    name = "fecha"
    type = "N"
  }

  global_secondary_index {
    name            = "FechaIndex"
    hash_key        = "tipo"
    range_key       = "fecha"
    projection_type = "ALL"
  }

  attribute {
    name = "tipo"
    type = "S"
  }

  tags = {
    Name        = "Comentarios"
    Environment = var.environment # Usa la variable definida en variables.tf
  }
}
