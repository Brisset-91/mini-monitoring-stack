
# Outputs útiles
output "table_name" {
  value       = aws_dynamodb_table.comentarios.name
  description = "Nombre de la tabla DynamoDB"
}

output "table_arn" {
  value       = aws_dynamodb_table.comentarios.arn
  description = "ARN de la tabla DynamoDB"
}