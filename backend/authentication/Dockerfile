FROM node:18-slim

WORKDIR /app

# Copy application code
COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.js"]
