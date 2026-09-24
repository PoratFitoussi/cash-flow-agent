FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the production bundle
RUN npm run build

# Install a simple static server
RUN npm install -g serve

EXPOSE 5173

# Serve the production build folder on port 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
