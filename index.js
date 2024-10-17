import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LocationController } from "./controllers/locationController.js";
import { DeviceController } from "./controllers/deviceController.js";
import { UserController } from "./controllers/userController.js";
import { UserService } from "./services/userService.js";
import { authenticateToken } from "./middleware/auth.js";
import "dotenv/config";

const app = express();
app.use(express.json());

const locationController = new LocationController();
const deviceController = new DeviceController();
const userController = new UserController();

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

  // const result = userController.login(username, password);
  // if (result.error) {
  //   return res.status(result.status).json({ error: result.error });
  // }

  // res
  //   .status(result.status)
  //   .json({ message: result.message, token: result.token, user: result.user });

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

//#region Locations

// Returns locations with optional filtering
app.get("/api/locations", (req, res) => {
  // Grab query parameters
  const deviceId = req.query.deviceId;
  const filter = req.query.filter;

  const result = locationController.getLocations(deviceId, filter);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json(result.data);
});

// Returns a specific location
app.get("/api/locations/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const result = locationController.getLocation(id);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json(result.data);
});

// Stores a location
app.post("/api/locations", (req, res) => {
  const data = req.body;

  const result = locationController.postLocation(data);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json(result.data);
});

//#endregion Locations

//#region Devices

app.get("/api/devices", (req, res) => {
  const result = deviceController.getDevices();
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json(result.data);
});

// Stores a device
app.post("/api/devices", (req, res) => {
  const data = req.body;

  const result = deviceController.postDevice(data);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json(result.data);
});

//#endregion Devices

const port = process.env.PORT || 8118;
const ip = "0.0.0.0";
app.listen(port, ip, () => console.log(`Server is listening on ${ip}:${port}`));
