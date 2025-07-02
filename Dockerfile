# Usar Node.js 18 como imagen base
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Crear directorio para imágenes si no existe
RUN mkdir -p src/libs/image

# Exponer el puerto
EXPOSE 3000

# Comando para desarrollo (con nodemon)
CMD ["npm", "run", "start:dev"]