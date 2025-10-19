# Acquisitions API

A Node.js application using Express.js, Drizzle ORM, and Neon Database for acquisitions management.

## Prerequisites

- Docker and Docker Compose
- pnpm (for local development)
- Node.js 18+ (for local development)

## Development Setup

### Using Docker Script (Recommended)

A convenient bash script `docker.bash` is provided to manage the Docker environment:

```bash
# Make script executable (first time only)
chmod +x docker.bash

# Start development environment
./docker.bash start dev

# View logs
./docker.bash logs dev

# Run migrations
./docker.bash migrate dev

# Stop environment
./docker.bash stop dev

# Clean up
./docker.bash clean

# Show all available commands
./docker.bash help
```

### Using Docker Compose Directly

1. **Clone the repository:**
   ```bash
   git clone https://github.com/y-noah0/acquisitions.git
   cd acquisitions
   ```

2. **Start the development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

   This will:
   - Start Neon Local (local PostgreSQL proxy with Neon API)
   - Build and start the application
   - Run database migrations automatically
   - The app will be available at http://localhost:4000

3. **Access Neon Local:**
   - PostgreSQL: `postgres://user:password@localhost:5432/neondb`
   - Neon API: http://localhost:4444

### Local Development (Without Docker)

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up Neon Local:**
   ```bash
   docker run --rm -p 4444:4444 -p 5432:5432 ghcr.io/neondatabase/neon-local
   ```

3. **Configure environment:**
   Copy `.env.development` and ensure DATABASE_URL points to Neon Local.

4. **Run migrations:**
   ```bash
   pnpm run db:migrate
   ```

5. **Start the application:**
   ```bash
   pnpm run dev
   ```

## Production Deployment

### Using Docker Script

```bash
# Build production images
./docker.bash build prod

# Start production environment
./docker.bash start prod

# Run migrations in production
./docker.bash migrate prod

# View production logs
./docker.bash logs prod

# Stop production
./docker.bash stop prod
```

### Using Docker Compose

1. **Configure production environment:**
   - Copy `.env.production` to your production server
   - Set the `DATABASE_URL` to your Neon Cloud database URL
   - Example: `DATABASE_URL=postgres://user:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

2. **Deploy:**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

   This will:
   - Build the application
   - Run database migrations
   - Start the app in production mode
   - The app will be available on port 4000

### Environment Variables

- **Development:** Uses `.env.development` with Neon Local connection
- **Production:** Uses `.env.production` with Neon Cloud connection

The application automatically switches between environments based on the `DATABASE_URL` provided.

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status
- `GET /api` - API status
- `POST /api/auth/*` - Authentication endpoints

## Database

- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (Neon)
- **Migrations:** `pnpm run db:migrate`
- **Generate migrations:** `pnpm run db:generate`
- **Studio:** `pnpm run db:studio`

## Scripts

- `pnpm run dev` - Start development server with watch mode
- `pnpm start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Fix ESLint issues
- `pnpm run format` - Format code with Prettier
- `pnpm run db:generate` - Generate database migrations
- `pnpm run db:migrate` - Run database migrations
- `pnpm run db:studio` - Open Drizzle Studio

## Docker

### Using Docker Script
- **Development:** `./docker.bash start dev`
- **Production:** `./docker.bash start prod`
- **Build:** `./docker.bash build <dev|prod>`
- **Logs:** `./docker.bash logs <dev|prod> [service]`
- **Stop:** `./docker.bash stop <dev|prod>`
- **Clean:** `./docker.bash clean`
- **Status:** `./docker.bash status`

### Using Docker Compose Directly
- **Development:** `docker-compose -f docker-compose.dev.yml up --build`
- **Production:** `docker-compose -f docker-compose.prod.yml up --build -d`

## Security

- Helmet for security headers
- CORS enabled
- Arcjet for additional security middleware
- JWT for authentication