export default class DbInitializer {
  constructor(private client: any) {
  }

  async initialize(): Promise<any> {
    await this.client.command({
      query: `create table if not exists telemetry2
          (
            deviceId String,
            timestamp DateTime,
            value Float32,
            key String)
          engine MergeTree()
          order by timestamp`,
    });
    this.client.command({
      query: `create table if not exists devices
          (
            id String,
            name String)
          engine ReplacingMergeTree()
          primary Key (id)`,
    });
  }
}
