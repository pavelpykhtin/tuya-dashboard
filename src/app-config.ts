import fs from 'fs';

export default class AppConfig {
  static fromFile(path: string): any {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  }
}
