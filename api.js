// ===============================
// API SERVER (api.js) — COMMONJS VERSION
// ===============================

const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// ===============================
// HARD-CODED CONFIG
// ===============================

// Must match Roblox API_KEY
const API_KEY = "a6b47363-cb6e-4bb1-842e-da2048ff95ef";

// Your bot server URL (NO trailing slash)
const BOT_URL = "http://85.215.137.163:9438";

// Debug log
console.log("[API] Using BOT_URL:", BOT_URL);

// Pending actions queue
let pendingActions = [];

// ===============================
// AUTH MIDDLEWARE
// ===============================
function auth(req, res) {
    if (req.headers.authorization !== API_KEY) {
        console.log("[API] Unauthorized request:", req.headers.authorization);
        res.status(403).json({ error: "Unauthorized" });
        return false;
    }
    return true;
}

// ===============================
// ROBLOX → API → BOT: Send Report
// ===============================
app.post("/report", async (req, res) => {
    if (!auth(req, res)) return;

    console.log("[API] Incoming report:", req.body);

    try {
        const botResponse = await fetch(`${BOT_URL}/sendReport`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body)
        });

        console.log("[API] Bot response status:", botResponse.status);

        res.json({ success: true });
    } catch (err) {
        console.error("[API] Failed to reach bot:", err);
        res.status(500).json({ error: "Bot unreachable" });
    }
});

// ===============================
// ROBLOX → API: Send Log
// ===============================
app.post("/log", (req, res) => {
    if (!auth(req, res)) return;

    console.log("[API] Log received:", req.body);
    res.json({ success: true });
});

// ===============================
// ROBLOX → API: Get Actions
// ===============================
app.get("/actions", (req, res) => {
    if (!auth(req, res)) return;

    console.log("[API] Roblox requested actions:", pendingActions);

    const actions = [...pendingActions];
    pendingActions = [];

    res.json(actions);
});

// ===============================
// BOT → API: Push Action to Roblox
// ===============================
app.post("/pushAction", (req, res) => {
    console.log("[API] Bot pushed action:", req.body);

    pendingActions.push(req.body);
    res.json({ success: true });
});

// ===============================
// ROBLOX → API: Acknowledge Action
// ===============================
app.post("/ack", (req, res) => {
    if (!auth(req, res)) return;

    console.log("[API] Roblox acknowledged:", req.body);
    res.json({ success: true });
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`[API] Running on port ${PORT}`);
});
