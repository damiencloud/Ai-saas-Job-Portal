FROM mcr.microsoft.com/playwright:v1.61.1-jammy

WORKDIR /app

# Copy root workspace manifests
COPY package.json turbo.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/ ./packages/

# Install node dependencies
RUN npm ci

# Copy full application code
COPY . .

# Generate Prisma Client
RUN npm run db:generate --workspace=@career-ops/database

EXPOSE 10000

CMD ["npm", "start", "--workspace=@career-ops/api"]
