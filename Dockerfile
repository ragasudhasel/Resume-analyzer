# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine

# Configure Nginx to listen on port 7860 (Hugging Face standard)
RUN sed -i 's/listen\(.*\)80;/listen 7860;/' /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 7860
EXPOSE 7860

CMD ["nginx", "-g", "daemon off;"]
