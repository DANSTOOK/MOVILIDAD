FROM node:18-alpine

WORKDIR /app

# Install backend dependencies first (better layer caching)
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy the whole repo (frontend index.html + backend source)
COPY . .

EXPOSE 3001

CMD ["node", "backend/server.js"]
