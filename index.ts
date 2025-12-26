/**
 * Main entry point for O-RAN Unified Monitoring Platform
 * Provides unified access to all adapters and system initialization
 */

import { createTelemetryAdapter, AdapterConfig } from './shared/api/TelemetryAdapter';
import { TelemetryAdapter } from './shared/api/TelemetryAdapter';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

/**
 * Main application class
 */
export class OranUnifiedMonitoring {
  private adapter: TelemetryAdapter | null = null;
  private config: AdapterConfig | null = null;

  /**
   * Initialize the monitoring system
   * @param configPath Optional path to configuration file
   */
  async initialize(configPath?: string): Promise<void> {
    // Load configuration
    this.config = await this.loadConfig(configPath);

    // Create appropriate adapter
    this.adapter = await createTelemetryAdapter(this.config);

    // Initialize adapter
    await this.adapter.initialize();

    console.log('O-RAN Unified Monitoring initialized');
    console.log(`Adapter: ${this.adapter.getMetadata().name}`);
    console.log(`Type: ${this.adapter.getMetadata().type}`);
    console.log(`Capabilities: ${this.adapter.getMetadata().capabilities.join(', ')}`);
  }

  /**
   * Start monitoring
   */
  async start(): Promise<void> {
    if (!this.adapter) {
      throw new Error('System not initialized. Call initialize() first.');
    }

    await this.adapter.start();
    console.log('Monitoring started');
  }

  /**
   * Stop monitoring
   */
  async stop(): Promise<void> {
    if (this.adapter) {
      await this.adapter.stop();
      console.log('Monitoring stopped');
    }
  }

  /**
   * Get current device context
   */
  async getDeviceContext() {
    if (!this.adapter) {
      throw new Error('System not initialized. Call initialize() first.');
    }

    return await this.adapter.getDeviceContext();
  }

  /**
   * Get the active adapter
   */
  getAdapter(): TelemetryAdapter | null {
    return this.adapter;
  }

  /**
   * Check if system is ready
   */
  isReady(): boolean {
    return this.adapter?.isReady() || false;
  }

  /**
   * Load configuration from file or environment
   */
  private async loadConfig(configPath?: string): Promise<AdapterConfig> {
    // Try to load from provided path
    if (configPath && fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, 'utf8');
      const config = yaml.parse(configFile);
      return config.adapter || config;
    }

    // Try environment variable
    const envConfigPath = process.env.CONFIG_PATH;
    if (envConfigPath && fs.existsSync(envConfigPath)) {
      const configFile = fs.readFileSync(envConfigPath, 'utf8');
      const config = yaml.parse(configFile);
      return config.adapter || config;
    }

    // Try default locations
    const defaultPaths = [
      path.join(process.cwd(), 'config', 'infrastructure.yaml'),
      path.join(process.cwd(), 'config', 'android.yaml'),
      path.join(process.cwd(), 'config', 'hybrid.yaml'),
    ];

    for (const defaultPath of defaultPaths) {
      if (fs.existsSync(defaultPath)) {
        const configFile = fs.readFileSync(defaultPath, 'utf8');
        const config = yaml.parse(configFile);
        if (config.adapter) {
          return config.adapter;
        }
      }
    }

    // Fallback to simulation mode
    console.warn('No configuration file found. Using simulation mode.');
    return {
      type: 'simulation',
    };
  }
}

/**
 * Auto-detect environment and create appropriate adapter
 */
export async function createMonitoringSystem(configPath?: string): Promise<OranUnifiedMonitoring> {
  const system = new OranUnifiedMonitoring();
  await system.initialize(configPath);
  return system;
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const system = new OranUnifiedMonitoring();
  
  system.initialize()
    .then(() => system.start())
    .then(() => {
      console.log('O-RAN Unified Monitoring Platform is running');
      console.log('Press Ctrl+C to stop');
    })
    .catch((error) => {
      console.error('Failed to start monitoring system:', error);
      process.exit(1);
    });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await system.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await system.stop();
    process.exit(0);
  });
}

