# Quick Start Guide

## Prerequisites

- Node.js 18+ and npm
- Android Studio (for Android builds)
- O-RAN testbed running (for infrastructure mode)
- API keys for geolocation services (optional)

## Installation

### 1. Clone and Install Dependencies

```bash
cd O-RAN-Unified-Monitoring
npm install
cd ui && npm install && cd ..
```

### 2. Build the Project

Before running, you need to build the TypeScript code:

```bash
npm run build
```

### 3. Choose Your Deployment Mode

#### Option A: Android Device Mode

1. Open `android/` in Android Studio
2. Build and deploy to device
3. Grant required permissions when prompted
4. The app will automatically use Android telemetry APIs

#### Option B: Infrastructure Mode

1. Configure `config/infrastructure.yaml` with your O-RAN endpoints
2. Set environment variables:
   ```bash
   # Windows (cmd)
   set ORAN_AUTH_TOKEN=your-token
   set GOOGLE_MAPS_API_KEY=your-key
   
   # Windows (PowerShell)
   $env:ORAN_AUTH_TOKEN="your-token"
   $env:GOOGLE_MAPS_API_KEY="your-key"
   
   # Linux/Mac
   export ORAN_AUTH_TOKEN=your-token
   export GOOGLE_MAPS_API_KEY=your-key
   ```
3. Build the project (if not already built):
   ```bash
   npm run build
   ```
4. Start the infrastructure server:
   ```bash
   npm run start:infrastructure
   ```
5. In a separate terminal, start the UI:
   ```bash
   npm run start:ui
   ```
6. Open your browser to `http://localhost:5173`

#### Option C: Hybrid Mode

1. Configure `config/hybrid.yaml` with your O-RAN endpoints
2. Set environment variables (same as Infrastructure Mode)
3. Build the project:
   ```bash
   npm run build
   ```
4. Start the infrastructure server:
   ```bash
   npm run start:infrastructure
   ```
5. Deploy Android app with infrastructure endpoints configured
6. The app will fuse Android and infrastructure data

#### Option D: Simulation Mode (Development)

1. No configuration needed
2. Install UI dependencies (if not already done):
   ```bash
   cd ui && npm install && cd ..
   ```
3. Start UI:
   ```bash
   npm run start:ui
   ```
4. Open your browser to `http://localhost:5173`
5. Uses simulated data for testing

## Configuration Examples

### Minimal Android Configuration

```yaml
# config/android.yaml
adapter:
  type: android
  android:
    enableLocation: true
    enableTelephony: true
    updateIntervalMs: 1000
```

### O-RAN Testbed Integration

```yaml
# config/infrastructure.yaml
adapter:
  type: infrastructure
  infrastructure:
    oran:
      ricEndpoint: ws://localhost:8080/ric
      xappEndpoints:
        - http://localhost:8081/api/v1/metrics
```

### With Network Probes

```yaml
infrastructure:
  probes:
    - type: sniffer
      endpoint: http://probe:9000/api/probe
      protocol: http
      auth:
        type: api-key
        credentials: ${PROBE_API_KEY}
```

## Running the Application

### Development Mode

```bash
# Build TypeScript code first
npm run build

# UI only (simulation mode - no backend needed)
npm run start:ui

# Infrastructure server (in one terminal)
npm run start:infrastructure

# UI connected to infrastructure (in another terminal)
npm run start:ui
```

### Production Build

```bash
# Build TypeScript
npm run build

# Build UI for production
cd ui && npm run build && cd ..

# Build Android APK (requires Android Studio and Gradle)
npm run build:android
```

## Testing

### Test Android Integration

1. Deploy to Android device
2. Check that permissions are granted
3. Verify telemetry data appears in UI

### Test Infrastructure Integration

1. Ensure O-RAN testbed is running
2. Build the project: `npm run build`
3. Start infrastructure server: `npm run start:infrastructure`
4. Check `/api/health` endpoint: `http://localhost:3000/api/health`
5. Verify WebSocket connections at `ws://localhost:3000`
6. Start UI: `npm run start:ui` and verify it connects to the infrastructure server

### Test Hybrid Mode

1. Configure both Android and infrastructure
2. Deploy Android app
3. Verify data fusion in UI

## Troubleshooting

### Android: No Telemetry Data

- Check permissions in Android Settings
- Verify location services are enabled
- Check logcat for errors

### Infrastructure: Connection Failed

- Build the project first: `npm run build`
- Verify O-RAN endpoints are accessible
- Check authentication tokens are set correctly
- Review firewall rules
- Check that the infrastructure server is running on port 3000
- Verify the config file path: `config/infrastructure.yaml`

### UI: Adapter Not Ready

- Install UI dependencies: `cd ui && npm install && cd ..`
- Check browser console for errors
- Verify adapter configuration
- Ensure required services are running (infrastructure server for infrastructure mode)
- For simulation mode, no backend is needed - it should work automatically
- Check that the build completed successfully: `npm run build`

## Next Steps

- See [INTEGRATION.md](INTEGRATION.md) for detailed integration guide
- Review [README.md](README.md) for architecture overview
- Customize adapters for your specific use case

