# 🚀 CI/CD Pipeline with DynamoDB on Kubernetes

Pipeline completo de CI/CD que automatiza el build, testing y deployment de una aplicación full-stack (Frontend + Backend) con DynamoDB, usando GitHub Actions, Docker, Kubernetes (Kind) y LocalStack.

## ✨ Características

- **CI/CD Automatizado**: Pipeline completo con GitHub Actions
- **Testing en Kubernetes**: Usa Kind para simular entorno productivo
- **DynamoDB Local**: LocalStack para desarrollo y testing
- **Multi-etapa**: Build → Test → Deploy
- **Infrastructure as Code**: Terraform para DynamoDB de AWS

## 🎥 Demo del pipeline CI/CD

<video src="assets/DemoUno.mp4" width="600" controls></video>

<video src="assets/DemoDos.mp4" width="600" controls></video>


## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions CI/CD                     │
├─────────────────────────────────────────────────────────────┤
│  1. Checkout → 2. Build → 3. Test → 4. Deploy              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster (Kind)                 │
├──────────────────────┬──────────────────────────────────────┤
│   Frontend Service   │         Backend Service              │
│   (LoadBalancer)     │         (ClusterIP)                  │
│         ↓            │              ↓                       │
│   Frontend Pods      │        Backend Pods                  │
│   (Nginx + HTML)     │        (Node.js API)                 │
└──────────────────────┴──────────────┬───────────────────────┘
                                      ↓
                        ┌──────────────────────────┐
                        │   LocalStack/DynamoDB    │
                        │   (Table: comentarios)   │
                        └──────────────────────────┘
```

## 📦 Requisitos Previos

### Para CI/CD (GitHub Actions)
- Cuenta de GitHub con Actions habilitado
- Docker Hub account
- Secrets configurados en GitHub:
  - `DOCKER_USERNAME`
  - `DOCKER_PASSWORD`

### Para Deployment Local
- Docker Desktop con Kubernetes habilitado
- kubectl instalado y configurado
- Terraform 1.6.0+
- AWS CLI (opcional, para testing)

### Para Deployment en AWS
- Cuenta AWS con permisos para:
  - DynamoDB
  - EKS (Elastic Kubernetes Service)
  - IAM
- kubectl configurado para EKS
- Terraform instalado

### Para el Frontend intalar extención en Visual Studio Code
- Live Server

## 📁 Estructura del Proyecto

```
.
├── .github/
│   └── workflows/
│       └── cicd.yaml           # Pipeline principal
├── backend/
│   ├── server.js               # Código Node.js
│   ├── tests/                  # Tests backend
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── css/
│   └── Dockerfile
├── k8s/
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   └── frontend-service.yaml
├── terraform-local-demo/
│   ├── main.tf                 # Configuración DynamoDB
│   ├── outputs.tf 
│   └── variables.tf
└── README.md
```

## 🔄 Pipeline CI/CD

### Etapas del Pipeline

#### 1. **Setup & Build**
- Checkout del código
- Configuración Node.js 22
- Build de imágenes Docker (backend y frontend)

#### 2. **Infrastructure Setup**
- Deploy de LocalStack (DynamoDB local)
- Terraform init & apply
- Creación de tabla `comentarios` con GSI `FechaIndex`

#### 3. **Testing**
- Tests unitarios backend (npm test)
- Verificación de tabla DynamoDB
- Validación de imágenes Docker

#### 4. **Kubernetes Testing**
- Creación de cluster Kind
- Deploy de LocalStack en K8s
- Deploy de aplicación completa
- Validación de deployments
- Health checks

#### 5. **Docker Registry**
- Tag de imágenes con SHA y latest
- Push a Docker Hub (solo si tests pasan)

#### 6. **Deployment Artifacts**
- Generación de scripts de deployment en https://github.com/Brisset-91/mini-monitoring-stack/actions
- Documentación actualizada

### Tabla DynamoDB

```
Tabla: comentarios
├── Partition Key: id (String)
├── Attributes:
│   ├── fecha (Number) - Timestamp
│   ├── tipo (String) - Tipo de comentario
│   ├── contenido (String)
│   └── autor (String)
└── Global Secondary Index: FechaIndex
    ├── Partition Key: tipo
    └── Sort Key: fecha
```

## ⚙️ Configuración

### 1. GitHub Secrets

Configura los siguientes secrets en tu repositorio:

```
Settings → Secrets and variables → Actions → New repository secret
```

- `DOCKER_USERNAME`: Tu usuario de Docker Hub
- `DOCKER_PASSWORD`: Tu token de Docker Hub

### 2. Variables de Entorno

El pipeline usa las siguientes variables:

```yaml
AWS_REGION: us-east-1
AWS_ACCESS_KEY_ID: test
AWS_SECRET_ACCESS_KEY: test
DYNAMODB_ENDPOINT: http://localhost:4566
TABLE_NAME: comentarios
```

### 3. Configuración Local

Para desarrollo local, crea un archivo `.env`:

```bash
AWS_REGION=us-east-1
DYNAMODB_ENDPOINT=http://localhost:4566
TABLE_NAME=comentarios
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

## 🏠 Deployment Local

### Opción 1: Script Automático

```bash
# El pipeline genera este script automáticamente en https://github.com/Brisset-91/mini-monitoring-stack/actions
chmod +x deploy-to-local.sh
./deploy-to-local.sh
```

### Opción 2:

```bash
# 1. Habilitar Kubernetes en Docker Desktop
Settings → Kubernetes → Enable Kubernetes

# 2. Verificar conexión
kubectl cluster-info

# 3. Instalación de Dependencias
cd backend
npm install

# 4. Instalar Terraform
# En macOS:
brew install terraform

# 5. Iniciar LocalStack con Docker
cd backend
npm run localstack:up

# 6. Verificar que está corriendo
docker ps

# 7. Inicializar y Aplicar Terraform
cd terraform-local-demo
terraform init
terraform plan
terraform apply

# O usa el script npm:
cd backend
npm run terraform:apply

```

### Acceder a la Aplicación

```bash
# Frontend
En el pestaña ubicada en frontend/index.html usar Live Server
ejemplo de link: 
http://127.0.0.1:5500/frontend/index.html 

# Backend API
http://localhost:3000

# Logs
kubectl logs -l app=backend
kubectl logs -l app=frontend
```

```bash

# Limpiar y reiniciar
terraform destroy
rm -rf .terraform
terraform init
terraform apply
```

### Logs en Tiempo Real

```bash
# Backend
kubectl logs -f -l app=backend

# Frontend
kubectl logs -f -l app=frontend

# LocalStack
kubectl logs -f -l app=localstack -n localstack
```

```bash

## 📝 Notas Adicionales

- El pipeline solo hace push a Docker Hub cuando todos los tests pasan
- Las imágenes se tagean con el SHA del commit y `latest`
- Kind se usa para testing, no para producción
- LocalStack simula DynamoDB gratuitamente para desarrollo
- Los manifests de Kubernetes se preparan automáticamente con los tags correctos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 👥 Autores

- Brisset Corcino Paz - [GitHub](https://github.com/Brisset-91)

---
