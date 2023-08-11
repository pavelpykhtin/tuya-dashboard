import Tuya from './api/api.js';
import TuyaConfig from './api/config.js';
import commandLineArgs from 'command-line-args';
import AppConfig from './app-config.js';
import DeviceStateService from './services/device-state.service.js';
import TelemetryRepository from './storage/telemetry.repository.js';
import DbInitializer from './storage/db-initializer.js';
import { createClient } from '@clickhouse/client';
import { Metric } from './storage/telemetry.repository.js';
import { map, tap } from 'rxjs/operators';
import TelemetryExtractorService from './services/telemetry-adapter.service.js';

const optionDefinitions = [
  { name: 'config', alias: 'c', type: String, defaultValue: './config.json' },
  { name: 'email', alias: 'e', type: String },
  { name: 'password', alias: 'p', type: String }
];

const options = commandLineArgs(optionDefinitions);
console.log(JSON.stringify(options));

const config = AppConfig.fromFile(options.config);
const configClickhouse = config.clickhouse;
const apiConfig = TuyaConfig.fromRoot(config, 'api');
const tuya = new Tuya(apiConfig);

const clickhouseClient = createClient({
  host: configClickhouse.host,
  username: configClickhouse.username,
  password: configClickhouse.password
});
const dbInitializer = new DbInitializer(clickhouseClient);
await dbInitializer.initialize();

const telemetryRepository = new TelemetryRepository(clickhouseClient);
const metricExtractor = new TelemetryExtractorService(config.shcemesFolder);

console.log("Authorizing...");
await tuya.auth(options.email, options.password);
console.log("Authorized");


const deviceService = new DeviceStateService(tuya);
const devices$ = deviceService.devices
  .pipe(
    map(devices => devices.reduce((acc: Metric[], device) => {
      acc.push(...metricExtractor.extract(new Date(), device));
      return acc;
    }, [])),
    tap(x => console.log(x)))
  .subscribe(async metrics => await telemetryRepository.saveBatch(metrics));

console.log("Press any key to exit");

await waitForKeyboard();

console.log("Cleanup");

devices$.unsubscribe();

function waitForKeyboard() {
  return new Promise(resolve => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      resolve(null);
    });
  });
}
