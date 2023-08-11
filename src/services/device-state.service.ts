import { Observable, timer, switchMap, map } from 'rxjs';
import Device from '../api/models/device.js';
import Tuya from '../api/api.js';

export default class DeviceStateService {
  QueryPeriod = 1 * 60 * 1000;

  get devices(): Observable<Device[]> {
    return timer(0, this.QueryPeriod)
      .pipe(
        switchMap(() => this.api.getDevices()),
        map(devices => devices.map(x => x.data)),
        map(devices => devices.reduce((acc, x) => {
          acc.push(...x);
          return acc;
        })),
      )
  }

  constructor(private api: Tuya) {

  }
}
