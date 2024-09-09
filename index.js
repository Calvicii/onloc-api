import express from "express";
import cors from "cors";
import fs from "fs";
const app = express();
app.use(express.json());

const locationPath = "./location.json";

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.get("/api/location", (req, res) => {
  res.status(200).json(getFileContent(locationPath));
});

app.get("/api/location/latest", (req, res) => {
  const devices = getDevices();
  let locations = [];

  for (const device of devices) {
    locations.push(getLastLocationOfDevice(locationPath, device))
  }

  if (locations) {
    res.status(200).json(locations);
  } else {
    res.status(404).json({ error: `Latest location not found` });
  }
});

app.get("/api/location/latest/:device", (req, res) => {
  const device = req.params.device;
  const location = getLastLocationOfDevice(locationPath, device);

  if (location) {
    res.status(200).json(location);
  } else {
    res.status(404).json({ error: `Location with device ${device} not found` });
  }
});

app.get("/api/location/devices", (req, res) => {
  const devices = getDevices(locationPath);

  if (devices) {
    res.status(200).json(devices);
  } else {
    res
      .status(404)
      .json({ error: `Location with device ${devices} not found` });
  }
});

app.get("/api/location/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const location = getObjectById(locationPath, id);
  if (location) {
    res.status(200).json(location);
  } else {
    res.status(404).json({ error: `Location with id ${id} not found` });
  }
});

app.post("/api/location", (req, res) => {
  const data = req.body;

  data.id = getLastId(locationPath) + 1;

  let fullData = getFileContent(locationPath);

  fullData.push(data);

  fs.writeFileSync(locationPath, JSON.stringify(fullData, null, 2));

  res.status(201).json(data);
});

const port = 8118;
const ip = "0.0.0.0";
app.listen(port, ip, () => console.log(`Server is listening on ${ip}:${port}`));

function getFileContent(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (error) {
    return [];
  }
}

function getObjectById(path, id) {
  try {
    const data = JSON.parse(fs.readFileSync(path, "utf8"));
    return data.find((item) => item.id === id);
  } catch (error) {
    return [];
  }
}

function getLastId(path) {
  try {
    const data = JSON.parse(fs.readFileSync(path, "utf8"));

    if (data.length === 0) {
      throw new Error("File is empty");
    }

    return data[data.length - 1].id;
  } catch (error) {
    return 0;
  }
}

function getDevices(path) {
  let devices = [];

  for (const device of getFileContent(locationPath)) {
    if (devices.indexOf(device.device) === -1) {
      devices.push(device.device);
    }
  }

  return devices;
}

function getLastLocationOfDevice(path, name) {
  let location;

  for (const entry of getFileContent(path)) {
    if (entry.device === name) {
      location = entry;
    }
  }

  return location;
}
