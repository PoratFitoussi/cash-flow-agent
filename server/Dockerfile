FROM node:20-bookworm-slim

# Install Chromium and necessary dependencies (works natively on ARM64 Macs)
RUN apt-get update \
    && apt-get install -y chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create a wrapper to force --no-sandbox (since the scraper library ignores custom args)
RUN echo '#!/bin/bash\nexec /usr/bin/chromium --no-sandbox --disable-setuid-sandbox "$@"' > /usr/local/bin/chromium-wrapper \
    && chmod +x /usr/local/bin/chromium-wrapper

# Tell Puppeteer to skip downloading Chrome and use our wrapper
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/local/bin/chromium-wrapper

# Set up the working directory inside the container
WORKDIR /usr/src/app

# Copy dependency definitions and install them
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 3001

# Default command to run the API server
CMD ["npm", "run", "start:api"]