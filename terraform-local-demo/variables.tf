variable "table_name" {
  description = "El nombre deseado para la tabla de DynamoDB."
  type        = string
  default     = "ComentariosApp" # Valor por defecto opcional
}

variable "environment" {
  description = "El entorno de despliegue (e.g., dev, prod)."
  type        = string
  default     = "development"
}