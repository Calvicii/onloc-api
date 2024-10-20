import { LocationService } from "../services/locationService.js";

export class LocationController {
  constructor() {
    const locationsPath = "./locations.json";
    this.locationService = new LocationService(locationsPath);
  }

  getLocations(deviceId = null, filter = null) {
    try {
      const locations = this.locationService.loadLocations();

      if (filter === "latest") {
        const latestLocations = {};

        locations.forEach((location) => {
          if (
            !latestLocations[location.deviceId] ||
            new Date(location.timestamp) >
              new Date(latestLocations[location.deviceId].timestamp)
          ) {
            latestLocations[location.deviceId] = location;
          }
        });

        if (deviceId) {
          if (latestLocations[deviceId]) {
            return { status: 200, data: latestLocations[deviceId] };
          } else {
            return {
              status: 404,
              error: `No locations found for device ${deviceId}`,
            };
          }
        }

        return { status: 200, data: Object.values(latestLocations) };
      }

      if (deviceId) {
        const filteredLocations = locations.filter(
          (loc) => loc.deviceId === deviceId
        );
        return { status: 200, data: filteredLocations };
      }

      return { status: 200, data: locations };
    } catch (error) {
      console.error("Error loading locations:", error);
      return { status: 500, error: "Failed to load locations" };
    }
  }

  getLocation(id) {
    try {
      const locations = this.locationService.loadLocations();
      const location = locations.find((loc) => loc.id === id);

      if (location) {
        return { status: 200, data: location };
      } else {
        return { status: 404, error: `Location with id ${id} not found` };
      }
    } catch (error) {
      console.error("Error loading locations:", error);
      return { status: 500, error: "Failed to load locations" };
    }
  }

  postLocation(location) {
    try {
      if (
        !location.timestamp ||
        location.mocked === null ||
        location.mocked === undefined ||
        !location.coords ||
        !location.deviceId
      ) {
        return {
          status: 400,
          error:
            "Missing required fields: timestamp, mocked, coords and deviceId",
        };
      }

      const newLocation = locationService.addLocation(location);
      return { status: 201, data: newLocation };
    } catch (error) {
      console.error("Error saving location:", error);
      return { status: 500, error: "Failed to add location" };
    }
  }
}
