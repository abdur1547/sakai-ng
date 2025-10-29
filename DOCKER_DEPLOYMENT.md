# Docker Deployment Guide for Sakai Angular App

This guide explains how to deploy the Sakai Angular application using Docker for both development and production environments.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Yarn package manager

## Quick Start

### Production Deployment

1. **Build and start production environment:**
   ```bash
   ./docker-deploy.sh start-prod
   ```

2. **Access the application:**
   Open your browser and navigate to `http://localhost`

### Development Environment

1. **Start development environment:**
   ```bash
   ./docker-deploy.sh start-dev
   ```

2. **Access the application:**
   Open your browser and navigate to `http://localhost:4200`

## Manual Commands

### Production

```bash
# Build production image
docker build -t sakai-ng:latest .

# Start production containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

## Docker Configuration Files

### Core Files

- `Dockerfile` - Multi-stage production build
- `Dockerfile.dev` - Development environment
- `docker-compose.yml` - Production orchestration
- `docker-compose.dev.yml` - Development orchestration
- `nginx.conf` - Production nginx configuration
- `.dockerignore` - Files to exclude from Docker build
- `docker-deploy.sh` - Deployment automation script

### Architecture

#### Production Build (Multi-stage)

1. **Build Stage:**
   - Uses Node.js 18 Alpine image
   - Installs dependencies with yarn
   - Builds Angular app for production
   - Optimizes bundle size and performance

2. **Production Stage:**
   - Uses nginx Alpine image
   - Serves static files efficiently
   - Includes security headers and caching
   - Handles Angular routing (SPA)

#### Development Environment

- Hot reloading enabled
- Source code mounted as volume
- Development server on port 4200
- Real-time code changes

## Configuration Options

### Environment Variables

You can customize the deployment using environment variables:

```bash
# Production
export NODE_ENV=production

# Development
export NODE_ENV=development
```

### Nginx Configuration

The `nginx.conf` file includes:

- **Performance optimizations:** Gzip compression, caching headers
- **Security headers:** XSS protection, content security policy
- **SPA routing:** Fallback to index.html for client-side routing
- **Health checks:** `/health` endpoint
- **API proxy:** Ready-to-use backend proxy configuration (commented)

### SSL/HTTPS Setup

To enable HTTPS in production:

1. **Add SSL certificates:**
   ```bash
   mkdir ssl
   # Copy your SSL certificates to the ssl/ directory
   ```

2. **Update docker-compose.yml:**
   ```yaml
   volumes:
     - ./ssl:/etc/nginx/ssl:ro
   ```

3. **Uncomment HTTPS configuration in nginx.conf**

## Performance Optimizations

### Build Optimizations

- **Multi-stage build:** Reduces final image size
- **Alpine images:** Smaller base images
- **Layer caching:** Optimized for Docker layer caching
- **Production build:** Angular CLI production optimizations

### Runtime Optimizations

- **Nginx caching:** Static assets cached for 1 year
- **Gzip compression:** Reduces bandwidth usage
- **HTTP/2 support:** Faster loading times
- **Health checks:** Container health monitoring

## Monitoring and Logging

### Health Checks

Both development and production containers include health checks:

- **Production:** `curl -f http://localhost/`
- **Development:** `curl -f http://localhost:4200/`

### Logging

```bash
# Production logs
docker-compose logs -f sakai-ng

# Development logs
docker-compose -f docker-compose.dev.yml logs -f sakai-ng-dev
```

### Container Management

```bash
# View running containers
docker ps

# Check container health
docker inspect sakai-ng-prod | grep Health

# Container resource usage
docker stats sakai-ng-prod
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check if ports are in use
   netstat -tulpn | grep :80
   netstat -tulpn | grep :4200
   ```

2. **Build failures:**
   ```bash
   # Clear Docker cache
   docker builder prune

   # Rebuild without cache
   docker build --no-cache -t sakai-ng:latest .
   ```

3. **Permission issues:**
   ```bash
   # Make deploy script executable
   chmod +x docker-deploy.sh
   ```

### Debug Commands

```bash
# Enter running container
docker exec -it sakai-ng-prod sh

# Check nginx configuration
docker exec -it sakai-ng-prod nginx -t

# View container filesystem
docker exec -it sakai-ng-prod ls -la /usr/share/nginx/html
```

## Security Considerations

### Production Security

- **Nginx security headers:** XSS protection, content security policy
- **Non-root user:** Containers run as non-root user
- **Minimal attack surface:** Alpine base images
- **Health monitoring:** Container health checks

### Network Security

- **Isolated networks:** Docker networks for container isolation
- **Port exposure:** Only necessary ports exposed
- **SSL/TLS:** HTTPS configuration ready

## Scaling and Load Balancing

### Horizontal Scaling

```yaml
# In docker-compose.yml
services:
  sakai-ng:
    deploy:
      replicas: 3
    # ... rest of configuration
```

### Load Balancer Integration

The configuration includes commented Traefik setup for load balancing:

```bash
# Uncomment Traefik service in docker-compose.yml
# Configure Traefik for automatic service discovery
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy
        run: |
          ./docker-deploy.sh build-prod
          ./docker-deploy.sh start-prod
```

### GitLab CI Example

```yaml
deploy:
  script:
    - ./docker-deploy.sh build-prod
    - ./docker-deploy.sh start-prod
  only:
    - main
```

## Maintenance

### Regular Tasks

```bash
# Update base images
docker pull node:18-alpine
docker pull nginx:alpine

# Clean up unused resources
./docker-deploy.sh cleanup

# Update dependencies
yarn upgrade
```

### Backup and Recovery

```bash
# Backup application data (if using volumes)
docker run --rm -v sakai-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data

# Restore from backup
docker run --rm -v sakai-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /
```

## Support

For issues related to:
- **Docker setup:** Check this documentation and troubleshooting section
- **Angular application:** Refer to the main project README
- **Nginx configuration:** Check nginx.conf and logs

## Contributing

When contributing Docker-related changes:
1. Test both development and production environments
2. Update documentation for configuration changes
3. Ensure security best practices are followed
4. Test the deployment script functionality