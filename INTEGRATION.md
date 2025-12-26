# Integration Guide

This guide explains how to integrate the O-RAN Unified Monitoring platform with your O-RAN testbed and Android devices.

## Architecture Overview

The platform consists of three main components:

1. **Shared Core** (`shared/`): Common data models and adapter interfaces
2. **Android Module** (`android/`): Native Android bindings for device telemetry
3. **Infrastructure Adapters** (`infrastructure/`): O-RAN testbed and network probe integrations

## Android Integration

### 1. Setup Android Project

```bash
cd android
./gradlew build
```

### 2. Add to AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### 3. JavaScript Bridge

The Android WebView exposes `window.AndroidTelemetry` with the following API:

```javascript
// Initialize
await window.AndroidTelemetry.initialize();

// Start telemetry collection
await window.AndroidTelemetry.start();

// Get cell information
const cellInfo = JSON.parse(await window.AndroidTelemetry.getCellInfo());

// Get location
const location = JSON.parse(await window.AndroidTelemetry.getLocation());

// Get telephony state
const telephony = JSON.parse(await window.AndroidTelemetry.getTelephonyState());
```

## Infrastructure Integration

### 1. O-RAN Testbed Connection

Configure the infrastructure adapter to connect to your O-RAN components:

```yaml
# config/infrastructure.yaml
adapter:
  type: infrastructure
  infrastructure:
    oran:
      ricEndpoint: ws://your-ric-endpoint:8080/ric
      xappEndpoints:
        - http://your-xapp-1:8081/api/v1/metrics
        - http://your-xapp-2:8082/api/v1/metrics
      e2Endpoint: ws://your-e2-endpoint:8083/e2
      authToken: your-auth-token
```

### 2. Network Probes

Add network probe configurations:

```yaml
probes:
  - type: sniffer
    endpoint: http://probe-endpoint:9000/api/probe
    protocol: http
    auth:
      type: api-key
      credentials: your-api-key
```

### 3. Start Infrastructure Server

```bash
npm run start:infrastructure
```

The server provides:
- REST API at `http://localhost:3000/api/*`
- WebSocket at `ws://localhost:3000`

## Hybrid Mode

For devices that can access both Android APIs and infrastructure:

```yaml
# config/hybrid.yaml
adapter:
  type: hybrid
  hybrid:
    android:
      enableLocation: true
      enableTelephony: true
      updateIntervalMs: 1000
    infrastructure:
      oran:
        ricEndpoint: ws://10.0.2.2:8080/ric  # Android emulator host
    fusionStrategy: merge  # or 'android-priority' or 'infrastructure-priority'
```

## O-RAN xApp Integration

### KPM Monitor xApp

The infrastructure adapter automatically connects to KPM Monitor xApps. Ensure your xApp exposes metrics at:

```
GET /api/v1/metrics
```

Expected response format:
```json
[
  {
    "cellId": "12345",
    "timestamp": 1234567890,
    "metrics": {
      "rsrp": -85,
      "drbPdcpSduVolumeDl": 1024,
      "drbUeThpDl": 5000
    }
  }
]
```

### Custom xApp Integration

To integrate a custom xApp, implement the probe interface:

```typescript
// infrastructure/probes/CustomXAppProbe.ts
export class CustomXAppProbe implements ProbeAdapter {
  async fetchMetrics(): Promise<DeviceMetrics[]> {
    // Your xApp integration logic
  }
}
```

## Geolocation Services

### Google Maps API

```yaml
geolocation:
  providers:
    - google
  apiKeys:
    google: YOUR_GOOGLE_MAPS_API_KEY
```

### HERE API

```yaml
geolocation:
  providers:
    - here
  apiKeys:
    here: YOUR_HERE_API_KEY
```

### OpenCellId (Cell Tower Database)

```typescript
import { OpenCellIdProvider } from './geolocation/GeolocationAdapter';

const provider = new OpenCellIdProvider('your-api-key');
const location = await provider.getLocationFromCell(cellId, mcc, mnc, lac);
```

## Vendor API Integration

### Ericsson Example

```yaml
vendor:
  vendor: ericsson
  endpoint: https://api.ericsson.com/v1/telemetry
  auth:
    type: bearer
    credentials: YOUR_TOKEN
  apiVersion: v1
```

### Custom Vendor

Implement a vendor adapter:

```typescript
// infrastructure/vendors/CustomVendor.ts
export class CustomVendorAdapter {
  async fetchTelemetry(): Promise<TelemetryData> {
    // Vendor-specific API calls
  }
}
```

## Testing

### Simulation Mode

For development without hardware:

```typescript
const config: AdapterConfig = {
  type: 'simulation',
};
```

### Unit Tests

```bash
npm test
```

## Troubleshooting

### Android Permissions

If telemetry data is not available, check:
1. Permissions are granted in Android settings
2. Location services are enabled
3. Network state permission is granted

### O-RAN Connection Issues

1. Verify RIC/xApp endpoints are accessible
2. Check authentication tokens
3. Ensure WebSocket connections are not blocked by firewall
4. Review O-RAN testbed logs

### Geolocation Failures

1. Verify API keys are valid
2. Check API quota limits
3. Ensure network connectivity

## Performance Considerations

- **Android**: Update interval should be ≥ 1000ms to avoid battery drain
- **Infrastructure**: WebSocket connections are preferred over polling
- **Hybrid**: Fusion strategy affects CPU usage; 'merge' is most resource-intensive

## Security

- Never commit API keys or tokens to version control
- Use environment variables for sensitive configuration
- Implement proper authentication for infrastructure endpoints
- Follow Android security best practices for permission handling

