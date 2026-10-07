# website/frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy and build shared SDK first so file:../sdk dependency resolves
COPY sdk ./sdk
RUN cd sdk && npm install && npm run build

# Copy and build Frontend
COPY frontend ./frontend
WORKDIR /app/frontend

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app/frontend

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/package*.json ./
COPY --from=builder /app/frontend/node_modules ./node_modules
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/sdk /app/sdk

EXPOSE 3000

CMD ["npm", "run", "start"]
