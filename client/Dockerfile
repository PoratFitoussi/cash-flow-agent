FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Expose host to 0.0.0.0 so it can be mapped to local machine
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
