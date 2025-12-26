# Architecture Documentation

## System Overview

The O-RAN Unified Monitoring platform is designed to provide comprehensive telemetry and intelligence across both device (Android/embedded) and infrastructure (server/cloud) environments. It seamlessly integrates O-RAN testbed automation capabilities with native device telemetry.

## Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Unified React UI                          │
│  (Radar Display, Device List, Intelligence Panel)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Telemetry Adapter Abstraction Layer             │
│  (createTelemetryAdapter, AdapterConfig)                     │
└──────┬──────────────┬──────────────┬──────────────┬──────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐
│ Android  │  │Infrastructure│  │  Hybrid  │  │Simulation│
│ Adapter  │  │   Adapter    │  │ Adapter  │  │ Adapter  │
└────┬─────┘  └──────┬───────┘  └────┬─────┘  └──────────┘
     │               │                │
     │               │                │
     ▼               ▼                ▼
┌──────────┐  ┌──────────────┐  ┌──────────┐
│Android   │  │O-RAN Testbed│  │  Fused   │
│Native    │  │Components   │  │  Data    │
│APIs      │  │(RIC, xApps) │  │          │
└──────────┘  └──────────────┘  └──────────┘
```

## Component Layers

### 1. Shared Core (`shared/`)

**Purpose**: Common data models, interfaces, and utilities used across all adapters.

**Key Components**:
- `models/Device.ts`: Unified device and network cell models
- `api/TelemetryAdapter.ts`: Abstract adapter interface
- `api/SimulationTelemetryAdapter.ts`: Development/testing adapter

**Data Models**:
- `RadarDevice`: Represents a detected device with location, metrics, and metadata
- `NetworkCell`: Represents a cellular base station with signal metrics
- `DeviceContext`: Complete context including devices, cells, and configuration
- `RadioMetrics`: Comprehensive radio signal measurements (RSRP, RSRQ, CQI, etc.)

### 2. Android Module (`android/`)

**Purpose**: Native Android bindings for device telemetry APIs.

**Components**:
- `TelemetryService.kt`: Core service using Android APIs
  - `TelephonyManager`: Cell info, signal strength, network type
  - `LocationManager`: GPS and network location
  - `CellInfo`: LTE and 5G NR cell information
- `TelemetryBridge.kt`: JavaScript bridge for WebView integration
- `MainActivity.kt`: Android activity hosting WebView

**Android APIs Used**:
- `TelephonyManager.getAllCellInfo()`: Get serving and neighbor cells
- `LocationManager.requestLocationUpdates()`: Real-time location
- `CellInfoLte` / `CellInfoNr`: LTE and 5G NR cell details
- `CellSignalStrengthLte` / `CellSignalStrengthNr`: Signal metrics

**Permissions Required**:
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`
- `READ_PHONE_STATE`
- `ACCESS_NETWORK_STATE`

### 3. Infrastructure Adapters (`infrastructure/`)

**Purpose**: Connect to O-RAN testbed components, network probes, and vendor APIs.

#### O-RAN Integration (`oran/InfrastructureTelemetryAdapter.ts`)

**Connections**:
- **RIC (RAN Intelligent Controller)**: WebSocket connection for real-time control
- **xApps**: REST API endpoints for metrics (KPM Monitor, Anomaly Detection, etc.)
- **E2 Interface**: WebSocket for E2SM indications and control messages

**Supported xApps**:
- KPM Monitor: Key Performance Metrics
- Anomaly Detection: Cell and UE anomaly detection
- Traffic Steering: Load balancing and handover optimization
- Quality Predictor: QoE prediction

#### Network Probes (`probes/`)

**Types**:
- **Sniffer**: Passive network monitoring
- **Monitor**: Active network probing
- **Custom**: Vendor-specific probes

**Protocols**:
- HTTP/REST: Polling-based metrics
- WebSocket: Real-time streaming
- gRPC: High-performance RPC

#### Geolocation Services (`geolocation/GeolocationAdapter.ts`)

**Providers**:
- **Google Maps API**: Reverse geocoding, address lookup
- **HERE API**: Geocoding and routing
- **OpenCellId**: Cell tower location database
- **Custom**: Extensible for other providers

**Features**:
- Reverse geocoding (lat/lon → address)
- Forward geocoding (address → lat/lon)
- Cell tower location lookup (MCC/MNC/Cell ID → location)

#### Vendor APIs

**Supported Vendors**:
- Ericsson: Network telemetry API
- Extensible for Nokia, Samsung, etc.

### 4. Hybrid Adapter (`infrastructure/hybrid/HybridTelemetryAdapter.ts`)

**Purpose**: Fuse Android device measurements with O-RAN infrastructure intelligence.

**Fusion Strategies**:
- **android-priority**: Prefer device measurements, supplement with infrastructure
- **infrastructure-priority**: Prefer infrastructure data, supplement with device
- **merge**: Combine both sources, deduplicate, prefer stronger signals

**Use Cases**:
- Enhanced situational awareness on mobile devices
- Device-side RF sensing augmented with network intelligence
- Real-time anomaly detection combining device and network data

### 5. UI Layer (`ui/`)

**Components**:
- `RadarDisplay`: Polar coordinate visualization of devices
- `DeviceList`: Tabular device information
- `IntelligencePanel`: Tactical summary and system intent
- `TechInsights`: Technical metrics and analytics
- `AdapterStatus`: Connection status and adapter metadata

**State Management**:
- `RadarState.tsx`: React Context for global state
- Auto-detects environment and selects appropriate adapter
- Provides unified interface regardless of adapter type

## Data Flow

### Android Mode

```
Android Device
    │
    ├─ TelephonyManager → Cell Info (RSRP, RSRQ, PCI, etc.)
    ├─ LocationManager → GPS/Network Location
    └─ TelephonyManager → Network State
         │
         ▼
    TelemetryService.kt
         │
         ▼
    TelemetryBridge.kt (JavaScript Interface)
         │
         ▼
    AndroidTelemetryAdapter.ts
         │
         ▼
    RadarState (React Context)
         │
         ▼
    UI Components
```

### Infrastructure Mode

```
O-RAN Testbed
    │
    ├─ RIC → WebSocket → Control & Metrics
    ├─ xApps → REST API → KPM Metrics
    ├─ E2 Interface → WebSocket → E2SM Indications
    └─ Network Probes → HTTP/WebSocket → Probe Data
         │
         ▼
    InfrastructureTelemetryAdapter.ts
         │
         ├─ GeolocationService → Cell Location Lookup
         └─ Vendor APIs → Vendor-Specific Metrics
         │
         ▼
    RadarState (React Context)
         │
         ▼
    UI Components
```

### Hybrid Mode

```
Android Device ──┐
                 ├─→ HybridTelemetryAdapter ──→ RadarState ──→ UI
O-RAN Testbed ───┘     (Data Fusion)
```

## Configuration System

### Configuration Files

- `config/android.yaml`: Android device configuration
- `config/infrastructure.yaml`: Server/infrastructure configuration
- `config/hybrid.yaml`: Hybrid mode configuration

### Environment Variables

- `ORAN_AUTH_TOKEN`: Authentication token for O-RAN components
- `GOOGLE_MAPS_API_KEY`: Google Maps API key
- `HERE_API_KEY`: HERE API key
- `PROBE_API_KEY`: Network probe API key
- `CONFIG_PATH`: Path to configuration file

## API Contracts

### TelemetryAdapter Interface

```typescript
interface TelemetryAdapter {
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  getDeviceContext(): Promise<DeviceContext>;
  onDeviceUpdate(callback: (devices: RadarDevice[]) => void): () => void;
  onCellUpdate(callback: (cells: NetworkCell[]) => void): () => void;
  getServingCell(): Promise<NetworkCell | null>;
  getNeighborCells(): Promise<NetworkCell[]>;
  isReady(): boolean;
  getMetadata(): AdapterMetadata;
}
```

### Android JavaScript Bridge

```javascript
window.AndroidTelemetry = {
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  getCellInfo(): Promise<string>;  // JSON string
  getLocation(): Promise<string>;  // JSON string
  getTelephonyState(): Promise<string>;  // JSON string
  requestPermissions(): Promise<string>;  // JSON string
  onCellInfoUpdate(callback: (info: string) => void): void;
  onLocationUpdate(callback: (location: string) => void): void;
  onTelephonyUpdate(callback: (state: string) => void): void;
}
```

### Infrastructure REST API

- `GET /api/health`: Health check
- `GET /api/context`: Get device context
- `GET /api/devices`: Get all devices
- `GET /api/cells`: Get serving and neighbor cells
- `POST /api/geolocation/reverse`: Reverse geocoding
- `POST /api/geolocation/cell`: Cell tower location lookup

### Infrastructure WebSocket

```json
{
  "type": "devices",
  "data": RadarDevice[]
}

{
  "type": "cells",
  "data": NetworkCell[]
}
```

## Security Considerations

1. **Android Permissions**: Runtime permission requests, minimal required permissions
2. **API Keys**: Stored in environment variables, never committed
3. **Authentication**: Bearer tokens for O-RAN components
4. **Network Security**: HTTPS/WSS for production, configurable for development
5. **Data Privacy**: Location and telemetry data handled according to platform guidelines

## Performance Optimizations

1. **Update Intervals**: Configurable per adapter (Android: ≥1000ms)
2. **WebSocket Connections**: Persistent connections for real-time updates
3. **Data Fusion**: Efficient merging algorithms in hybrid mode
4. **UI Rendering**: React memoization, requestAnimationFrame for smooth animations
5. **Caching**: Cell location caching to reduce API calls

## Extensibility

### Adding a New Adapter

1. Implement `TelemetryAdapter` interface
2. Add to `createTelemetryAdapter` factory
3. Create configuration schema
4. Update documentation

### Adding a New Geolocation Provider

1. Implement `GeolocationProvider` interface
2. Add to `GeolocationService`
3. Update configuration schema

### Adding a New xApp Integration

1. Create probe adapter implementing probe interface
2. Add to infrastructure configuration
3. Map xApp metrics to `RadarDevice` model

## Testing Strategy

1. **Unit Tests**: Adapter interfaces, data models, utilities
2. **Integration Tests**: Adapter implementations, API contracts
3. **E2E Tests**: Full UI workflows with simulation adapter
4. **Device Tests**: Android instrumentation tests
5. **Infrastructure Tests**: O-RAN testbed integration tests

