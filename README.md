/# O-RAN Unified Monitoring & Intelligence Platform

A comprehensive solution that combines O-RAN testbed automation capabilities with native device telemetry to provide unified monitoring, intelligence, and control across device and infrastructure environments.

## Architecture Overview

This platform operates in two primary modes:

### 1. Device Mode (Android/Embedded)
- Binds to official Android radio/telemetry APIs
- Uses TelephonyManager for cellular network measurements
- Leverages LocationManager for geolocation
- Accesses operator-approved feeds via Android APIs
- Provides real-time RF sensing and device tracking

### 2. Infrastructure Mode (Server/Cloud)
- Integrates with O-RAN testbed components (RIC, xApps)
- Connects to network probes and monitoring systems
- Interfaces with geolocation services
- Supports vendor-specific APIs
- Provides centralized network intelligence

## Key Features

- **Unified Data Model**: Common interfaces for device and infrastructure data
- **Real-time Telemetry**: Live radio measurements and network metrics
- **O-RAN Integration**: Direct connection to RIC, xApps, and testbed components
- **Geolocation Services**: Multi-source location intelligence
- **Vendor API Support**: Extensible adapter system for vendor-specific APIs
- **Cross-Platform**: Works on Android devices and Linux servers

## Project Structure

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
│   └── geolocation/     # Geolocation service adapters
├── ui/                  # Unified React UI
└── config/              # Configuration files

```

## Installation

### Device Mode (Android)
1. Open project in Android Studio
2. Build and deploy to Android device
3. Grant required permissions (Location, Phone, Network)

### Infrastructure Mode
1. Install Node.js dependencies: `npm install`
2. Configure O-RAN testbed connection in `config/infrastructure.yaml`
3. Start server: `npm run start:infrastructure`

## Configuration

See `config/` directory for environment-specific configurations.

## License

See LICENSE file for details.

