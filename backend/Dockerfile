# Usa una imagen oficial de Node.js
FROM node:22

# Crea un directorio de trabajo
WORKDIR /app

# Copia los archivos
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Expón el puerto que usa tu app
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["node", "index.js"]
