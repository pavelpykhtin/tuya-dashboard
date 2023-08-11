export default class DbInitializer {
  constructor(private client: any) {
  }

  initialize(): Promise<any> {
    return this.client.command({
      query: `create table if not exists telemetry2
          (
            deviceId String,
            timestamp DateTime,
            value Float32,
            key String)
          engine MergeTree()
          order by timestamp`,
    });
  }
}
