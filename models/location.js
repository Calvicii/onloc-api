import { Coords } from "./coords.js";

export class Location {
  constructor(id, timestamp, mocked, coords, deviceId) {
    this.id = id;
    this.timestamp = timestamp;
    this.mocked = mocked;
    this.coords = new Coords(coords.altitude, coords.heading, coords.altitude, coords.altitudeAccuracy, coords.latitude, coords.speed, coords.longitude, coords.accuracy);
    this.deviceId = deviceId;
  }
}
