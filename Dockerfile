FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./

# Create data directory
RUN mkdir -p data

EXPOSE 3001

CMD ["npm", "start"]
