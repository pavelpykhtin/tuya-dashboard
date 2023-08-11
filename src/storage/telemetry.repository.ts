export class Metric {
  deviceId: string;
  timestamp: number;
  value: number;
  key: string;
}

export default class TelemetryRepository {
  constructor(private client: any) {

  }

  async save(metric: Metric) {
    await this.saveBatch([metric]);
  }

  async saveBatch(metrics: Metric[]): Promise<any> {
    await this.client.insert({
      table: 'telemetry2',
      values: metrics,
      format: 'JSONEachRow'
    });
  }
}
