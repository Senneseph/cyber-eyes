# Cyber-Eyes CI/CD

This directory contains the continuous integration and deployment configuration for the Cyber-Eyes project.

## Contents

- `build.yml` - GitHub Actions workflow for building the library
- `test.yml` - GitHub Actions workflow for running tests
- `publish.yml` - GitHub Actions workflow for publishing to npm
- `scripts/` - Helper scripts for CI/CD processes

## Build Process

The build process for Cyber-Eyes includes:

1. Linting the source code
2. Running unit tests
3. Building the library
4. Running integration tests
5. Generating documentation
6. Publishing to npm (on release only)

## Local Development

For local development, you can use the following commands:

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run tests
npm test

# Build the library
npm run build

# Generate documentation
npm run docs
```

## Deployment

Deployment is handled automatically by GitHub Actions when a new release is created. The process includes:

1. Building the library
2. Running tests
3. Publishing to npm
4. Updating the documentation website

## Environment Variables

The following environment variables are used in the CI/CD process:

- `NPM_TOKEN` - Token for publishing to npm
- `GITHUB_TOKEN` - Token for GitHub API access
- `DOCS_DEPLOY_KEY` - SSH key for deploying documentation

These should be set as secrets in the GitHub repository settings.
