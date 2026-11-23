import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import axios from 'axios';
import crypto from 'crypto';

dotenv.config();
const app = express();
app.use(express.json());

const server = http.createServer(app);
const port = process.env.PORT || 5000;
// Same value as SOCKET_SECRET in the Next.js .env.local (optional for local practice)
const secretHeaders = { headers: { "x-socket-secret": process.env.SOCKET_SECRET || "" } };

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
    methods: ["GET", "POST"]
  }
})

io.on("connection", (socket) => {

  // Client tells us which user this socket belongs to.
  // Payload: { userId, token } where token comes from the Next.js /api/socket/token route.
  socket.on("identity", async (payload) => {
    const userId = verifyIdentity(payload);
    if (!userId) {
      console.log("identity rejected for socket", socket.id);
      return;
    }
    try {
      await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`, { userId, socketId: socket.id }, secretHeaders)
      socket.data.userId = userId;
      // A GPS position may have arrived before the identity was confirmed
      if (socket.data.pendingLocation) {
        const { latitude, longitude } = socket.data.pendingLocation;
        socket.data.pendingLocation = null;
        await saveLocation(userId, latitude, longitude);
      }
    } catch (error) {
      console.log("identity error:", error.message);
    }
  })

  // Delivery boy (or any user) sends their live GPS position.
  // The user is the one verified in "identity", never an id sent with the position.
  socket.on("updateLocation", async ({ latitude, longitude } = {}) => {
    if (!isValidCoordinate(latitude, longitude)) return;
    const userId = socket.data.userId;
    if (!userId) {
      socket.data.pendingLocation = { latitude, longitude };
      return;
    }
    await saveLocation(userId, latitude, longitude);
  })

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  })
})

// Checks the signed token made by the Next.js app (src/lib/socketToken.ts).
// Without SOCKET_SECRET (local practice) the plain userId is trusted.
function verifyIdentity(payload) {
  const userId = typeof payload === "string" ? payload : payload?.userId;
  if (!userId || typeof userId !== "string") return null;
  const secret = process.env.SOCKET_SECRET;
  if (!secret) return userId;

  const token = typeof payload?.token === "string" ? payload.token : "";
  const [tokenUserId, expiresAt, signature] = token.split(".");
  if (!tokenUserId || !expiresAt || !signature || tokenUserId !== userId) return null;
  if (Number(expiresAt) < Date.now()) return null;
  const expected = crypto.createHmac("sha256", secret).update(`${tokenUserId}.${expiresAt}`).digest("hex");
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return userId;
}

function isValidCoordinate(latitude, longitude) {
  return typeof latitude === "number" && typeof longitude === "number" &&
    Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

async function saveLocation(userId, latitude, longitude) {
  const locationData = {
    type: "Point",
    coordinates: [longitude, latitude]
  }
  try {
    const result = await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/updateLocation`, { userId, location: locationData }, secretHeaders)
    // Only delivery boys' positions are shared, so customers tracking an order see them move
    if (result.data?.role === "deliveryBoy") {
      io.emit("update-deliveryBoy-location", { userId, location: locationData });
    }
  } catch (error) {
    console.log("updateLocation error:", error.message);
  }
}

// Next.js API routes call this to push events to clients
app.post("/notify", (req, res) => {
  if (process.env.SOCKET_SECRET && req.get("x-socket-secret") !== process.env.SOCKET_SECRET) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { event, data, socketId } = req.body;
  if (!event) {
    return res.status(400).json({ message: "event is required" });
  }
  if (socketId) {
    io.to(socketId).emit(event, data);
  } else {
    io.emit(event, data);
  }
  return res.status(200).json({ message: "Notification sent" });
})

server.listen(port, () => {
  console.log(`Socket server is running on port ${port}`);
})
