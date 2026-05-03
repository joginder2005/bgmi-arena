import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import withdrawalRoutes from "./routes/withdrawalRoutes.js";

dotenv.config();

const app = express();

const defaultAllowedOrigins = ["https://bgmi-arena.vercel.app"];
const allowedOrigins = [
...defaultAllowedOrigins,
...(process.env.CLIENT_URL || "")
.split(",")
.map((origin) => origin.trim())
.filter(Boolean),
];

const isLocalOrigin = (origin) => {
try {
const { hostname } = new URL(origin);
return ["localhost", "127.0.0.1", "::1"].includes(hostname);
} catch {
return false;
}
};

app.use(
cors({
origin(origin, callback) {
if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin) || isLocalOrigin(origin)) {
return callback(null, true);
}
return callback(new Error("CORS origin not allowed"));
},
credentials: true,
})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(async (req, res, next) => {
if (req.method === "OPTIONS") {
return next();
}

try {
await connectDB();
return next();
} catch (error) {
return next(error);
}
});

app.get("/", (req, res) => {
res.json({ message: "BGMI Arena API running" });
});

app.get("/health", (req, res) => {
res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
const server = app.listen(PORT, () => {
console.log(`Server listening on port ${PORT}`);
});

server.on("error", (error) => {
if (error.code === "EADDRINUSE") {
console.error(`Port ${PORT} is already in use. Stop the existing backend process or set a different PORT in backend/.env.`);
process.exit(1);
}
throw error;
});
}

export default app;
