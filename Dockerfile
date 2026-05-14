# Use a lightweight Nginx image
FROM nginx:alpine

# Copy the built files from the dist folder to the Nginx html directory
COPY dist /usr/share/nginx/html

# Expose port 80 (Hugging Face Spaces will automatically route traffic)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
