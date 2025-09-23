
# 1. Usa una imagen oficial de NGINX como base
FROM nginx:alpine

# 2. Borra los archivos por defecto que vienen en NGINX
RUN rm -rf /usr/share/nginx/html/*

# 3. Copia tu código frontend al lugar donde NGINX lo servirá
COPY . /usr/share/nginx/html

# 4. Expone el puerto 80 para que puedas acceder desde tu navegador
EXPOSE 80

# 5. Inicia NGINX en primer plano (sin cerrar el contenedor)
CMD ["nginx", "-g", "daemon off;"]

