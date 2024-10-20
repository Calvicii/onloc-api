import { DeviceService } from "../services/deviceService.js";
import { LocationController } from "./locationController.js";
import { UserService } from "../services/userService.js";

export class DeviceController {
  constructor() {
    const devicesPath = "./devices.json";
    this.deviceService = new DeviceService(devicesPath);

    this.locationController = new LocationController();

    const usersPath = "./users.json";
    this.userService = new UserService(usersPath);
  }

  getDevices() {
    try {
      const devices = this.deviceService.loadDevices();
  
      if (devices.length > 0) {
        for (const device of devices) {
          const locationResult = this.locationController.getLocations(device.id, "latest");
  
          if (locationResult.status === 200 && locationResult.data) {
            const latestLocation = locationResult.data[0];
            console.log(latestLocation);
            if (latestLocation && latestLocation.timestamp) {
              device.lastSeen = latestLocation.timestamp;
            }
          }
        }
        return { status: 200, data: devices };
      } else {
        return { status: 404, error: "No device found" };
      }
    } catch (error) {
      console.error("Error loading devices:", error);
      return { status: 500, error: "Failed to load devices" };
    }
  }
  

  postDevice(device) {
    try {
      if ((device.ownerId !== 0 && !device.ownerId) || device.name === "") {
        return {
          status: 400,
          error: "Missing required fields: ownerId and name",
        };
      }

      const users = this.userService.loadUsers();
      if (!users.some((user) => user.id === device.ownerId)) {
        return { status: 404, error: "Owner not found" };
      }

      const newDevice = this.deviceService.addDevice(device);
      return { status: 201, data: newDevice };
    } catch (error) {
      console.error("Error saving device:", error);
      return { status: 500, error: "Failed to save device" };
    }
  }
}
