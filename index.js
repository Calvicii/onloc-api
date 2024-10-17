import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LocationService } from "./services/locationService.js";
import { UserService } from "./services/userService.js";
import { authenticateToken } from "./middleware/auth.js";
import "dotenv/config";

const app = express();
app.use(express.json());

const locationsPath = "./locations.json";
const locationService = new LocationService(locationsPath);

const usersPath = "./users.json";
const userService = new UserService(usersPath);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = userService
      .loadUsers()
      .find((user) => user.username === username);

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const users = userService.loadUsers();

    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
      return res.status(409).json({ error: "Username is already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userService.addUser(username, hashedPassword);

    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: newUser.id, username: newUser.username },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "An error occurred during registration" });
  }
});

app.get("/api/user", authenticateToken, (req, res) => {
  res.status(200).json({ id: req.user.userId, username: req.user.username });
});

// Returns locations with optional filtering
app.get("/api/locations", (req, res) => {
  // Grab query parameters
  const deviceId = req.query.deviceId;
  const filter = req.query.filter;

  try {
    const locations = locationService.loadLocations(); // Load all locations

    // If the filter is 'latest', gather the latest location for each device
    if (filter === "latest") {
      const latestLocations = {};

      locations.forEach((location) => {
        if (
          !latestLocations[location.deviceId] ||
          new Date(location.timestamp) >
            new Date(latestLocations[location.deviceId].timestamp)
        ) {
          latestLocations[location.deviceId] = location; // Update with latest location
        }
      });

      // If a deviceId is provided, return only that device's latest location
      if (deviceId) {
        if (latestLocations[deviceId]) {
          return res.status(200).json(latestLocations[deviceId]); // Return the latest location for the specified device
        } else {
          return res
            .status(404)
            .json({ error: `No locations found for device ${deviceId}` });
        }
      }

      return res.status(200).json(Object.values(latestLocations)); // Return latest locations for all devices
    }

    // If no filter is applied, return the filtered locations by deviceId
    if (deviceId) {
      const filteredLocations = locations.filter(
        (loc) => loc.deviceId === deviceId
      );
      return res.status(200).json(filteredLocations);
    }

    // If no filters are applied, return all locations
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error loading locations:", error);
    res.status(500).json({ error: "Failed to load locations" }); // Handle errors
  }
});

// Returns a specific location
app.get("/api/locations/:id", (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const locations = locationService.loadLocations();
    const location = locations.find((loc) => loc.id === id);

    if (location) {
      res.status(200).json(location);
    } else {
      res.status(400).json({ error: `Location with id ${id} not found` });
    }
  } catch (error) {
    console.error("Error loading locations:", error);
    res.status(500).json({ error: "Failed to load locations" });
  }
});

app.get("/api/devices", (req, res) => {
  try {
    const locations = locationService.loadLocations();
    let devices = [];

    for (let location of locations) {
      if (!devices.includes(location.deviceId)) {
        devices.push(location.deviceId);
      }
    }

    if (devices.length > 0) {
      res.status(200).json(devices);
    } else {
      res.status(404).json({ error: "No device found" });
    }
  } catch (error) {
    console.error("Error loading devices:", error);
    res.status(500).json({ error: "Failed to load devices" });
  }
});

// Stores a location
app.post("/api/locations", (req, res) => {
  try {
    const data = req.body;

    if (
      !data.timestamp ||
      data.mocked === null ||
      data.mocked === undefined ||
      !data.coords ||
      !data.deviceId
    ) {
      return res.status(400).json({
        error: "Missing required fields: timestamp, mocked, coords and deviceId",
      });
    }

    const newLocation = locationService.addLocation(data);
    res.status(201).json(newLocation);
  } catch (error) {
    console.error("Error saving location:", error);
    res.status(500).json({ error: "Failed to save location" });
  }
});

const port = process.env.PORT || 8118;
const ip = "0.0.0.0";
app.listen(port, ip, () => console.log(`Server is listening on ${ip}:${port}`));
