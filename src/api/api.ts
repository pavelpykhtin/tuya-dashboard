import Cloud from '@tuyapi/cloud';
import TuyaConfig from './config.js';
import Device from './models/device.js';
import Location from './models/location.js';

class Session {
  sid: string;
}

export default class Tuya {
  private session: Session = null;

  constructor(
    private config: TuyaConfig) {
    if (!this.config.isValid()) {
      throw new Error('Global config is not valid. Please use the \'config-tuya\' command first.');
    }
  }


  async auth(email, password): Promise<any> {
    return this.createApi().loginEx({ email, password })
      .then(sid => {
        this.session = { sid };
      })
      .catch(error => {
        throw new Error('Invalid credentials', error);
      });
  }

  async getTime() {
    const timeResp = await this.request({ action: 'tuya.p.time.get' });
    return timeResp;
  }

  async getDevices(): Promise<{group: Location, data: Device[]}[]> {
    // Get location list to obtain some GID
    const groups: Location[] = await this.request({ action: 'tuya.m.location.list' });

    if (groups.length === 0) {
      throw new Error('No device groups');
    }

    this.delay(1000);

    const results = groups
      .map(group =>
        this.request({ action: 'tuya.m.my.group.device.list', gid: group.groupId })
          .then(data => ({ group, data })));

    return await Promise.all(results);
  }

  delay(timeout: number) {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  async getSchemas(gids) {
    console.debug('getSchemas(%o)', gids);

    const results = [];
    for (const gid of gids) {
      results.push(this.request({ action: 'tuya.m.device.ref.info.my.list', gid }));
    }

    return Promise.all(results).then(schemaArrays => {
      console.debug(schemaArrays);
      const schemaDict = {};
      for (const schemaArr of schemaArrays) {
        for (const schema of schemaArr) {
          schemaDict[schema.id] = schema;
        }
      }

      return schemaDict;
    });
  }

  async switchState(gid, devId, enabled) {
    return this.request({
      action: 'tuya.m.device.dp.publish',
      gid,
      data: {
        devId,
        gwId: devId,
        dps: { 1: enabled }
      }
    });
  }

  async getMonthlyStats(gid, devId, dpId) {
    return this.request({
      action: 'tuya.m.dp.stat.month.list',
      gid,
      data: {
        devId,
        gwId: devId,
        dpId,
        type: 'sum'
      }
    });
  }

  async getDailyStats(gid, devId, dpId, startDay, endDay) {
    return this.request({
      action: 'tuya.m.dp.stat.days.list',
      gid,
      data: {
        devId,
        gwId: devId,
        dpId,
        startDay,
        endDay,
        type: 'sum'
      }
    });
  }

  private async request(data: {action: string} & any): Promise<any> {
    return await this.createApi().request(data);
  }

  private createApi(): Cloud {
    const api = new Cloud({
      key: this.config.key,
      secret: this.config.secret,
      secret2: this.config.secret2,
      certSign: this.config.certSign,
      apiEtVersion: '0.0.1',
      region: 'EU'
    });

    if(this.session) {
      api.sid = this.session.sid;
    }

    return api;
  }
}
