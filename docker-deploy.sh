#!/bin/bash

# Docker deployment scripts for Sakai Angular App

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Build production image
build_production() {
    print_status "Building production Docker image..."
    docker build -t sakai-ng:latest -t sakai-ng:production .
    if [ $? -eq 0 ]; then
        print_status "Production image built successfully!"
    else
        print_error "Failed to build production image"
        exit 1
    fi
}

# Start production deployment
start_production() {
    print_status "Starting production deployment..."
    docker-compose up -d
    if [ $? -eq 0 ]; then
        print_status "Production deployment started successfully!"
        print_status "Application is available at: http://localhost"
    else
        print_error "Failed to start production deployment"
        exit 1
    fi
}

# Start development environment
start_development() {
    print_status "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up -d
    if [ $? -eq 0 ]; then
        print_status "Development environment started successfully!"
        print_status "Application is available at: http://localhost:4200"
    else
        print_error "Failed to start development environment"
        exit 1
    fi
}

# Stop all containers
stop_containers() {
    print_status "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    print_status "All containers stopped"
}

# Clean up Docker resources
cleanup() {
    print_warning "This will remove all containers, images, and volumes related to this project"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down -v --rmi all
        docker-compose -f docker-compose.dev.yml down -v --rmi all
        docker system prune -f
        print_status "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Show logs
show_logs() {
    if [ "$2" == "dev" ]; then
        docker-compose -f docker-compose.dev.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Show help
show_help() {
    echo "Sakai Angular Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build-prod    Build production Docker image"
    echo "  start-prod    Start production deployment"
    echo "  start-dev     Start development environment"
    echo "  stop          Stop all containers"
    echo "  logs          Show production logs"
    echo "  logs-dev      Show development logs"
    echo "  cleanup       Remove all Docker resources"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build-prod && $0 start-prod"
    echo "  $0 start-dev"
    echo "  $0 logs"
}

# Main script logic
case "$1" in
    build-prod)
        check_docker
        build_production
        ;;
    start-prod)
        check_docker
        build_production
        start_production
        ;;
    start-dev)
        check_docker
        start_development
        ;;
    stop)
        stop_containers
        ;;
    logs)
        show_logs prod
        ;;
    logs-dev)
        show_logs dev
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac