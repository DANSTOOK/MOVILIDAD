FROM node:20-alpine

WORKDIR /app

# Install backend dependencies first (better layer caching)
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy the whole repo (frontend index.html + backend source)
COPY . .

EXPOSE 3001

CMD ["node", "backend/server.js"]
