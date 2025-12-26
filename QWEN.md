# O-RAN Unified Monitoring & Intelligence Platform

## Project Overview

The O-RAN Unified Monitoring & Intelligence Platform is a comprehensive solution that combines O-RAN testbed automation capabilities with native device telemetry to provide unified monitoring, intelligence, and control across device and infrastructure environments. This project is built using TypeScript for the core cross-platform functionality, with Android-specific modules for device-side monitoring and infrastructure adapters for O-RAN testbed integration.

The platform operates in dual modes:
- **Device Mode (Android/Embedded)**: Binds to official Android radio/telemetry APIs using TelephonyManager for cellular network measurements, LocationManager for geolocation, and operator-approved feeds via Android APIs
- **Infrastructure Mode (Server/Cloud)**: Integrates with O-RAN testbed components (RIC, xApps), connects to network probes and monitoring systems, and interfaces with geolocation services

## Key Technologies

- **TypeScript**: Primary language for shared code between device and infrastructure
- **React**: Used for the unified UI component
- **Node.js**: Runtime environment for the infrastructure server
- **Android SDK**: Native Android application development
- **O-RAN SC RMR (RIC Message Router)**: For O-RAN compliant messaging
- **WebSocket**: Real-time bidirectional communication
- **Express.js**: Web server framework for infrastructure mode

## Project Architecture

```
O-RAN-Unified-Monitoring/
├── shared/              # Shared TypeScript core
│   ├── models/          # Data models and interfaces
│   ├── api/             # API abstraction layer
│   └── utils/           # Shared utilities
├── android/             # Android native module
│   ├── app/             # Android application
│   └── native/          # Native radio/telemetry bindings
├── infrastructure/      # Infrastructure adapters
│   ├── oran/            # O-RAN testbed adapters
│   ├── probes/          # Network probe integrations
│   ├── vendors/         # Vendor-specific API adapters
│   ├── geolocation/     # Geolocation service adapters
│   └── rmr/             # RMR (RIC Message Router) components
├── ui/                  # Unified React UI
├── config/              # Configuration files
├── __tests__/           # Unit tests
└── index.ts             # Main entry point
```

### Core Components

1. **Main Entry Point (`index.ts`)**: Contains the `OranUnifiedMonitoring` class that serves as the main application controller, responsible for initializing appropriate adapters based on configuration
2. **Telemetry Adapters**: Abstract interface for collecting and processing telemetry data from different sources
3. **RMR Implementation**: O-RAN SC compliant RMR (RIC Message Router) client for messaging with O-RAN components
4. **Subscription Manager**: Implements O-RAN SC Subscription Manager patterns for managing xApp subscriptions
5. **Configuration System**: YAML-based configuration supporting environment variables and multiple deployment contexts

## Building and Running

### Prerequisites

- Node.js 18+ (for infrastructure mode)
- Android Studio (for Android development)
- Docker and Docker Compose (for containerized deployment)

### Infrastructure Mode Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Configure the platform with appropriate configuration (see `config/` directory)

4. Start the infrastructure server:
   ```bash
   npm run start:infrastructure
   ```

### Device Mode Setup

1. Navigate to the Android directory:
   ```bash
   cd android
   ```

2. Build the Android application:
   ```bash
   ./gradlew build
   ```

3. Deploy to Android device via Android Studio

### Containerized Deployment

Using Docker Compose for production deployment:

1. Build and start services:
   ```bash
   docker-compose up -d oran-monitoring
   ```

2. For development mode:
   ```bash
   docker-compose up oran-monitoring-dev
   ```

## Configuration

The platform supports multiple configuration strategies:

1. **YAML Configuration Files**: Located in the `config/` directory with environment-specific files (development.yaml, production.yaml, etc.)
2. **Environment Variables**: Support for O-RAN SC RMR environment variables and API keys
3. **Dynamic Configuration**: Runtime configuration loading with fallback mechanisms

Example infrastructure configuration in `config/infrastructure.yaml` includes settings for:
- RMR (RIC Message Router) endpoints and parameters
- O-RAN component endpoints (RIC, xApps, E2)
- Network probes with authentication
- Geolocation service API keys
- Vendor-specific API configurations

## O-RAN SC RMR Integration

The platform implements O-RAN SC compliant RMR (RIC Message Router) messaging following the Subscription Manager patterns. Key aspects include:

- Support for all O-RAN SC RMR environment variables
- Route management with static and dynamic route tables
- Subscription-based metrics collection from xApps
- E2 indication processing via RMR messages
- Backward compatibility with legacy endpoints

## Development Conventions

### Code Structure

- Shared code uses TypeScript path aliases (e.g., `@shared/*`, `@infrastructure/*`)
- Interface-first design with abstract adapter patterns
- Comprehensive error handling and graceful shutdown procedures
- Configuration-driven behavior with validation

### Testing

- Unit tests using Jest framework (`npm test`)
- Mock implementations for external dependencies
- Configuration validation tests

### Naming Conventions

- PascalCase for classes and interfaces
- camelCase for methods and properties
- UPPERCASE_SNAKE_CASE for constants
- Descriptive names following TypeScript idioms

## Security Considerations

- API keys and sensitive configuration values stored in environment variables
- Proper authentication for infrastructure endpoints
- Android permissions management following security best practices
- Input validation and sanitization for all external data

## Key Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run start`: Start the main application
- `npm run test`: Run unit tests
- `npm run lint`: Run ESLint code quality checks
- `npm run start:infrastructure`: Start the infrastructure server
- `npm run start:ui`: Start the React UI server
- `npm run build:android`: Build the Android application

## Deployment

The platform supports multiple deployment strategies:

1. **Direct Node.js**: Run as a Node.js application
2. **Containerized**: Deploy using Docker and Docker Compose
3. **Hybrid**: Deploy infrastructure components on servers while collecting data from Android devices

The platform includes pre-built Docker and Docker Compose configuration files to facilitate containerized deployments in both development and production environments.