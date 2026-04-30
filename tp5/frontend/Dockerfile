FROM node:20-alpine

WORKDIR /app

# Only copy package.json and package-lock.json (if present)
COPY package*.json ./
RUN npm install

# The source code will be mounted as a volume in docker-compose.yml,
# but we can copy it as a fallback.
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run the Vite dev server, allowing outside connections
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
