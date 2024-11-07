import { Coords } from "./Coords.js";

export class Location {
  constructor(id, timestamp, mocked, coords, deviceId) {
    this.id = id;
    this.timestamp = timestamp;
    this.mocked = mocked;
    this.coords = new Coords(coords.accuracy, coords.altitude, coords.altitudeAccuracy, coords.heading, coords.latitude, coords.longitude, coords.speed);
    this.deviceId = deviceId;
  }
}
