# O-RAN SC RMR Refactoring Summary

This document summarizes the refactoring of the O-RAN Unified Monitoring platform to align with O-RAN SC RMR (RIC Message Router) practices and Subscription Manager patterns.

## Overview

The codebase has been refactored to use O-RAN SC compliant RMR messaging instead of direct WebSocket connections, following the patterns outlined in:
- [O-RAN SC RMR Documentation](https://docs.o-ran-sc.org/projects/o-ran-sc-ric-plt-lib-rmr/en/latest/config-deploy.html)
- O-RAN SC Subscription Manager implementation patterns
- OpenAirInterface with Mosaic5G's FlexRIC patterns

## Key Changes

### 1. RMR Client Implementation (`infrastructure/rmr/RmrClient.ts`)

Created a new RMR client that implements:
- **Environment Variable Configuration**: Supports all O-RAN SC RMR environment variables:
  - `RMR_CTL_PORT`: Control port (default: 4561)
  - `RMR_RTG_SVC`: Route Manager service endpoint
  - `RMR_SRC_ID`: Source ID for messages
  - `RMR_SEED_RT`: Static route table file
  - `RMR_RTREQ_FREQ`: Route request frequency (default: 5 seconds)
  - `RMR_BIND_IF`: Bind interface IP
  - `RMR_ASYNC_CONN`: Async connection mode
  - `RMR_HR_LOG`: Human readable log format
  - `RMR_LOG_VLEVEL`: Log verbosity level (0-5)
  - `RMR_STASH_RT`: Stash route table file
  - `RMR_VCTL_FILE`: Verbosity control file
  - `RMR_WARNINGS`: Enable warnings

- **Route Management**: 
  - Loads static route tables from files
  - Connects to Route Manager for dynamic route updates
  - Periodic route table requests
  - Route stashing for debugging

- **Message Routing**:
  - Message type-based routing
  - Support for standard O-RAN SC message types:
    - `12010`: RIC_SUB_REQ (Subscription Request)
    - `12011`: RIC_SUB_RESP (Subscription Response)
    - `12050`: RIC_INDICATION (E2 Indication)

### 2. Subscription Manager (`infrastructure/rmr/SubscriptionManager.ts`)

Implemented subscription management following O-RAN SC Subscription Manager patterns:

- **REST Subscription Handling**: 
  - Handles subscription requests from xApps
  - Creates and manages subscriptions
  - Duplicate detection

- **E2 Subscription Management**:
  - E2AP message packing/unpacking
  - Transaction tracking
  - Async subscription processing
  - Response handling

- **Route Creation**:
  - Creates routes via Route Manager
  - Manages subscription routes
  - Routes indications to xApps

- **Transaction Management**:
  - Unique transaction IDs
  - Transaction state tracking
  - Timeout handling

### 3. Infrastructure Adapter Refactoring

The `InfrastructureTelemetryAdapter` has been refactored to:

- **Use RMR Instead of WebSocket**: 
  - Replaced direct WebSocket connections with RMR-based messaging
  - Maintains backward compatibility with legacy endpoints

- **Subscription-Based Metrics**:
  - Subscribes to xApp metrics via RMR subscriptions
  - Receives E2 indications via RMR messages
  - Processes metrics from active subscriptions

- **Route Management**:
  - Adds routes for E2 termination
  - Manages routes for xApp communication
  - Supports RMR-based probes

### 4. Configuration Updates

Updated configuration files to support RMR:

- **`config/infrastructure.yaml`**:
  - Added RMR configuration options
  - Environment variable support
  - Route Manager endpoint configuration
  - RMR-based probe examples

- **`shared/api/TelemetryAdapter.ts`**:
  - Extended `OranConfig` with RMR options:
    - `rtgSvc`: Route Manager service endpoint
    - `srcId`: Source ID for RMR messages
    - `seedRt`: Static route table file
    - `rtreqFreq`: Route request frequency
    - `routeManagerEndpoint`: Route Manager endpoint
  - Extended `ProbeConfig` to support RMR protocol

## Architecture Patterns

### Subscription Flow

1. **REST Subscription Request**: xApp sends subscription request via REST API
2. **Subscription Creation**: Subscription Manager creates subscription and transaction
3. **E2 Subscription**: E2AP subscription request is packed and sent via RMR
4. **Route Creation**: Route is created via Route Manager
5. **Indication Routing**: E2 indications are received via RMR and routed to xApp

### Message Flow

1. **Initialization**: RMR client initializes and connects to Route Manager
2. **Route Table Loading**: Static or dynamic route tables are loaded
3. **Message Sending**: Messages are sent via RMR using message type-based routing
4. **Message Receiving**: Messages are received via RMR and routed to handlers

## Environment Variables

The system now supports all O-RAN SC RMR environment variables. Set these before starting the application:

```bash
export RMR_CTL_PORT=4561
export RMR_RTG_SVC=routemgr:4561
export RMR_SRC_ID=my-xapp
export RMR_SEED_RT=/path/to/route_table.txt
export RMR_RTREQ_FREQ=5
export RMR_LOG_VLEVEL=2
```

## Migration Guide

### For Existing Deployments

1. **Update Configuration**: Add RMR configuration to `config/infrastructure.yaml`
2. **Set Environment Variables**: Configure RMR environment variables
3. **Update Endpoints**: Ensure Route Manager endpoint is configured
4. **Test Subscriptions**: Verify subscription creation and message routing

### For New Deployments

1. **Install Dependencies**: All dependencies are already included
2. **Configure RMR**: Set RMR environment variables or use config file
3. **Start Route Manager**: Ensure Route Manager is running
4. **Initialize System**: System will automatically use RMR if configured

## Benefits

1. **O-RAN SC Compliance**: Follows official O-RAN SC RMR patterns
2. **Better Integration**: Compatible with O-RAN SC testbeds
3. **Scalability**: Message type-based routing enables better scaling
4. **Maintainability**: Follows established patterns from Subscription Manager
5. **Flexibility**: Supports both static and dynamic route management

## Future Enhancements

1. **Native RMR Library**: Integrate with actual RMR C library bindings
2. **E2AP Encoding**: Implement proper E2AP ASN.1 encoding/decoding
3. **Route Manager Integration**: Full integration with Route Manager API
4. **Performance Optimization**: Optimize message routing and subscription handling
5. **Monitoring**: Add metrics and monitoring for RMR operations

## References

- [O-RAN SC RMR Documentation](https://docs.o-ran-sc.org/projects/o-ran-sc-ric-plt-lib-rmr/en/latest/config-deploy.html)
- [O-RAN SC RMR Main Page](https://docs.o-ran-sc.org/projects/o-ran-sc-ric-plt-lib-rmr/en/latest/)
- O-RAN SC Subscription Manager implementation patterns
- OpenAirInterface with Mosaic5G's FlexRIC

