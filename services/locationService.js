import fs from "fs";
import { Location } from "../models/location.js";
import { getNextId } from "../utils.js";

export class LocationService {
  constructor(filePath) {
    this.filePath = filePath;
  }

  loadLocations() {
    const fileContent = fs.readFileSync(this.filePath, "utf-8");
    const locationData = JSON.parse(fileContent);

    return locationData.map(
      (location) =>
        new Location(
          location.id,
          location.timestamp,
          location.mocked,
          location.coords,
          location.deviceId
        )
    );
  }

  addLocation(newLocationData) {
    const locations = this.loadLocations();
    const newLocation = new Location(
      getNextId(this.filePath),
      newLocationData.timestamp,
      newLocationData.mocked,
      newLocationData.coords,
      newLocationData.deviceId
    );

    locations.push(newLocation);
    this.saveLocations(locations);
    return newLocation;
  }

  saveLocations(locations) {
    const rawData = locations.map((location) => ({
      id: location.id,
      timestamp: location.timestamp,
      mocked: location.mocked,
      coords: location.coords,
      deviceId: location.deviceId,
    }));

    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2));
  }
}
