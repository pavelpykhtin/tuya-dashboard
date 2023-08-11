import fs from 'fs';
import Device from '../api/models/device.js';
import { Metric } from '../storage/telemetry.repository.js';

class MetricScheme{
  key: string;
  scale: number;
  index: number;
}

class DeviceScheme{
  productId: string;
  metrics: MetricScheme[]
}

export default class TelemetryExtractorService {
  private schemes: Map<string, DeviceScheme>;

  constructor(schemesFolder: string) {
    this.loadSchemes(schemesFolder);
  }

  extract(timestamp: Date, device: Device): Metric[] {
    const schema = this.schemes.get(device.productId);

    return !!schema
      ? schema.metrics.map(x => {
        return <Metric>{
          deviceId: device.devId,
          timestamp: Math.floor(timestamp.getTime() / 1000),
          value: +device.dps[x.index] / x.scale,
          key: x.key
        }
      })
      : [];
  }

  private loadSchemes(schemesFolder: string) {
    this.schemes = fs.readdirSync(schemesFolder)
      .map(file => JSON.parse(fs.readFileSync(`${schemesFolder}/${file}`, 'utf8')))
      .reduce((acc: Map<string, DeviceScheme>, scheme) => {
        acc.set(scheme.productId, scheme);
        return acc;
      }, new Map<string, DeviceScheme>());
  }
}
