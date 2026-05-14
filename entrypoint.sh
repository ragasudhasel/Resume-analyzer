#!/bin/sh

# Find the main JS file in the assets directory
# Vite usually names it index-[hash].js
JS_FILE=$(find /usr/share/nginx/html/assets -name "index-*.js" | head -n 1)

if [ -n "$VITE_GEMINI_API_KEY" ]; then
  echo "Injecting Gemini API Key into $JS_FILE..."
  # Replace the placeholder with the actual environment variable
  # We use a unique string that Vite likely produced for an empty env var
  sed -i "s|VITE_GEMINI_API_KEY_PLACEHOLDER|$VITE_GEMINI_API_KEY|g" "$JS_FILE"
fi

# Start Nginx
nginx -g "daemon off;"
