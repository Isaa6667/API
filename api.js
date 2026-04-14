const express = require("express");
const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY || "a6b47363-cb6e-4bb1-842e-da2048ff95ef";
const BOT_URL = process.env.BOT_URL; // URL of your Discord bot server

let pendingActions = [];

// Auth helper
function auth(req, res) {
    if (req.headers.authorization !== API_KEY) {
        res.status(403).json({ error: "Unauthorized" });
        return false;
    }
    return true;
}

// Roblox → Send Report
app.post("/report", async (req, res) => {
    if (!auth(req, res)) return;

    try {
        await fetch(`${BOT_URL}/sendReport`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body)
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Failed to send report to bot:", err);
        res.status(500).json({ error: "Bot unreachable" });
    }
});

// Roblox → Send Log
app.post("/log", (req, res) => {
    if (!auth(req, res)) return;

    console.log("Log received:", req.body);
    res.json({ success: true });
});

// Roblox → Get Actions
app.get("/actions", (req, res) => {
    if (!auth(req, res)) return;

    const actions = [...pendingActions];
    pendingActions = [];

    res.json(actions);
});

// Bot → Push Action to Roblox
app.post("/pushAction", (req, res) => {
    pendingActions.push(req.body);
    res.json({ success: true });
});

// Roblox → Acknowledge Action
app.post("/ack", (req, res) => {
    if (!auth(req, res)) return;

    console.log("Roblox acknowledged:", req.body);
    res.json({ success: true });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
