import Device from "../api/models/device.js";

export class DeviceInfo {
  id: string;
  name: string;
}

export default class DeviceRepository {
  constructor(private client: any) {
  }

  upsert(device: Device | Device[]) {
    const devices = Array.isArray(device) ? device : [device];

    const deviceInfos = devices.map(x => ({
      id: x.devId,
      name: x.name
    }));

    this.client.insert({
      table: 'devices',
      values: deviceInfos,
      format: 'JSONEachRow'
    });
  }
}
