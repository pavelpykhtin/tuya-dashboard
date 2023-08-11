import fs from 'fs';

export default class TuyaConfig {
  key: string;
  secret: string;
  secret2: string;
  certSign: string;

  static fromFile(path: string, section: string = null) {
    let data = JSON.parse(fs.readFileSync(path, 'utf8'));
    data = section ? data[section] : data;

    const config = new TuyaConfig();

    config.key = data.key;
    config.secret = data.secret;
    config.secret2 = data.secret2;
    config.certSign = data.certSign;

    return config;
  }

  static fromRoot(root: any, section: string = null) {
    let data = root;
    data = section ? data[section] : data;

    const config = new TuyaConfig();

    config.key = data.key;
    config.secret = data.secret;
    config.secret2 = data.secret2;
    config.certSign = data.certSign;

    return config;
  }

  isValid() {
    return !!this.key
      && !!this.secret
      && !!this.secret2
      && !!this.certSign;
  }
}
