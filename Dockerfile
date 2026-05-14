# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Set a placeholder that we will replace at runtime
ENV VITE_GEMINI_API_KEY=VITE_GEMINI_API_KEY_PLACEHOLDER
RUN npm run build

# Production Stage
FROM nginx:alpine

# Configure Nginx to listen on port 7860
RUN sed -i 's/listen\(.*\)80;/listen 7860;/' /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 7860

ENTRYPOINT ["/entrypoint.sh"]
