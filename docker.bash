#!/bin/bash

# Docker Flow Script for Acquisitions API
# This script provides commands to manage the Docker environment for development and production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if docker-compose files exist
check_compose_files() {
    if [ ! -f "docker-compose.dev.yml" ]; then
        print_error "docker-compose.dev.yml not found"
        exit 1
    fi
    if [ ! -f "docker-compose.prod.yml" ]; then
        print_error "docker-compose.prod.yml not found"
        exit 1
    fi
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found"
        exit 1
    fi
}

# Function to check environment files
check_env_files() {
    if [ "$1" = "dev" ] && [ ! -f ".env.development" ]; then
        print_error ".env.development not found"
        exit 1
    fi
    if [ "$1" = "prod" ] && [ ! -f ".env.production" ]; then
        print_error ".env.production not found"
        exit 1
    fi
}

# Function to build images
build() {
    local env=$1
    print_info "Building Docker images for $env environment..."
    if [ "$env" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml build
    elif [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml build
    else
        print_error "Invalid environment. Use 'dev' or 'prod'"
        exit 1
    fi
    print_success "Build completed"
}

# Function to start services
start() {
    local env=$1
    print_info "Starting $env environment..."
    check_env_files "$env"
    if [ "$env" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml up -d
        print_success "Development environment started"
        print_info "App available at: http://localhost:4000"
        print_info "Neon Local API at: http://localhost:4444"
        print_info "PostgreSQL at: localhost:5432"
    elif [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml up -d
        print_success "Production environment started"
        print_info "App available at: http://localhost:4000"
    else
        print_error "Invalid environment. Use 'dev' or 'prod'"
        exit 1
    fi
}

# Function to stop services
stop() {
    local env=$1
    print_info "Stopping $env environment..."
    if [ "$env" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml down
    elif [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml down
    else
        print_error "Invalid environment. Use 'dev' or 'prod'"
        exit 1
    fi
    print_success "Environment stopped"
}

# Function to restart services
restart() {
    local env=$1
    print_info "Restarting $env environment..."
    stop "$env"
    sleep 2
    start "$env"
}

# Function to view logs
logs() {
    local env=$1
    local service=$2
    if [ "$env" = "dev" ]; then
        if [ -n "$service" ]; then
            docker-compose -f docker-compose.dev.yml logs -f "$service"
        else
            docker-compose -f docker-compose.dev.yml logs -f
        fi
    elif [ "$env" = "prod" ]; then
        if [ -n "$service" ]; then
            docker-compose -f docker-compose.prod.yml logs -f "$service"
        else
            docker-compose -f docker-compose.prod.yml logs -f
        fi
    else
        print_error "Invalid environment. Use 'dev' or 'prod'"
        exit 1
    fi
}

# Function to run database migrations
migrate() {
    local env=$1
    print_info "Running database migrations for $env..."
    check_env_files "$env"
    if [ "$env" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml exec app pnpm run db:migrate
    elif [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml exec app pnpm run db:migrate
    else
        print_error "Invalid environment. Use 'dev' or 'prod'"
        exit 1
    fi
    print_success "Migrations completed"
}

# Function to generate migrations
generate() {
    print_info "Generating database migrations..."
    if [ -f ".env.development" ]; then
        export $(grep -v '^#' .env.development | xargs)
        pnpm run db:generate
    else
        print_error ".env.development not found"
        exit 1
    fi
    print_success "Migrations generated"
}

# Function to clean up
clean() {
    print_info "Cleaning up Docker resources..."
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down -v --remove-orphans 2>/dev/null || true
    docker system prune -f
    print_success "Cleanup completed"
}

# Function to show status
status() {
    print_info "Docker containers status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo
    print_info "Docker images:"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep acquisitions || true
}

# Function to show help
help() {
    echo "Docker Flow Script for Acquisitions API"
    echo
    echo "Usage: $0 <command> [environment] [options]"
    echo
    echo "Commands:"
    echo "  build <dev|prod>          Build Docker images"
    echo "  start <dev|prod>          Start environment"
    echo "  stop <dev|prod>           Stop environment"
    echo "  restart <dev|prod>        Restart environment"
    echo "  logs <dev|prod> [service]  View logs (optionally for specific service)"
    echo "  migrate <dev|prod>        Run database migrations"
    echo "  generate                  Generate database migrations (local)"
    echo "  clean                     Clean up Docker resources"
    echo "  status                    Show status of containers and images"
    echo "  help                      Show this help message"
    echo
    echo "Examples:"
    echo "  $0 build dev              Build development images"
    echo "  $0 start dev              Start development environment"
    echo "  $0 logs dev app           View app logs in development"
    echo "  $0 migrate prod           Run migrations in production"
    echo "  $0 clean                  Clean up all Docker resources"
}

# Main script logic
main() {
    check_docker
    check_compose_files

    case "${1:-help}" in
        build)
            if [ -z "$2" ]; then
                print_error "Environment required. Use 'dev' or 'prod'"
                exit 1
            fi
            build "$2"
            ;;
        start)
            if [ -z "$2" ]; then
                print_error "Environment required. Use 'dev' or 'prod'"
                exit 1
            fi
            start "$2"
            ;;
        stop)
            if [ -z "$2" ]; then
                print_error "Environment required. Use 'dev' or 'prod'"
                exit 1
            fi
            stop "$2"
            ;;
        restart)
            if [ -z "$2" ]; then
                print_error "Environment required. Use 'dev' or 'prod'"
                exit 1
            fi
            restart "$2"
            ;;
        logs)
            if [ -z "$2" ]; then
                print_error "Environment required. Use 'dev' or 'prod'"
                exit 1
            fi
            logs "$2" "$3"
            ;;
        migrate)
            if [ -z "$2" ]; then
                print_error "Environment required. Use 'dev' or 'prod'"
                exit 1
            fi
            migrate "$2"
            ;;
        generate)
            generate
            ;;
        clean)
            clean
            ;;
        status)
            status
            ;;
        help|--help|-h)
            help
            ;;
        *)
            print_error "Unknown command: $1"
            echo
            help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
