import { Device } from "../models/device.js";
import { getFileContent, writeToFile, getNextId } from "../utils.js";

export class DeviceService {
  constructor(deviceFilePath) {
    this.deviceFilePath = deviceFilePath;
  }

  loadDevices() {
    const fileContent = getFileContent(this.deviceFilePath);

    return fileContent.map(
      (device) => new Device(device.id, device.ownerId, device.name)
    );
  }

  addDevice(newDeviceData) {
    const devices = this.loadDevices();
    const newDevice = new Device(
      getNextId(this.deviceFilePath),
      newDeviceData.ownerId,
      newDeviceData.name
    );

    devices.push(newDevice);
    this.saveDevices(devices);
    return newDevice;
  }

  saveDevices(devices) {
    const rawData = devices.map((device) => ({
      id: device.id,
      ownerId: device.id,
      name: device.name,
    }));

    writeToFile(this.deviceFilePath, rawData);
  }
}
