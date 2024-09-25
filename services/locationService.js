import { Location } from "../models/location.js";
import { getFileContent, writeToFile, getNextId } from "../utils.js";

export class LocationService {
  constructor(filePath) {
    this.filePath = filePath;
  }

  loadLocations() {
    const fileContent = getFileContent(this.filePath);

    return fileContent.map(
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

    writeToFile(this.filePath, rawData);
  }
}
