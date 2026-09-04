FROM node:20-bullseye-slim

# Install necessary dependencies and google-chrome-stable so Puppeteer can run headlessly
RUN apt-get update \
    && apt-get install -y wget gnupg ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Prevent Puppeteer from downloading Chromium locally since we installed Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Set up the working directory inside the container
WORKDIR /usr/src/app

# Copy dependency definitions and install them
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Default command to run the scraper
CMD ["node", "index.js"]