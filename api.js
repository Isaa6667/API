// ===============================
// ROBLOX REPORT API (MAIN SERVER)
// ===============================

import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// CONFIG
const API_KEY = process.env.API_KEY;
const BOT_URL = process.env.BOT_URL;

if (!API_KEY || !BOT_URL) {
    console.error("Missing env variables");
    process.exit(1);
}

// ACTION QUEUE
let pendingActions = [];

// AUTH
function auth(req, res, next) {
    const key = req.headers.authorization;

    if (!key || key !== API_KEY) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    next();
}

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
    res.send("API is running");
});

// ===============================
// REPORT FROM ROBLOX
// ===============================
app.post("/report", auth, async (req, res) => {
    try {
        const { reporter, reported, reason } = req.body;

        if (!reporter || !reported || !reason) {
            return res.status(400).json({ error: "Invalid report" });
        }

        await fetch(`${BOT_URL}/sendReport`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body)
        });

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Bot error" });
    }
});

// ===============================
// GET ACTIONS (ROBLOX POLLING)
// ===============================
app.get("/actions", auth, (req, res) => {
    const actions = [...pendingActions];
    pendingActions = [];
    res.json(actions);
});

// ===============================
// BOT PUSH ACTION
// ===============================
app.post("/pushAction", auth, (req, res) => {
    const { action, target, moderator } = req.body;

    if (!action || !target) {
        return res.status(400).json({ error: "Invalid action" });
    }

    pendingActions.push({
        action,
        target,
        moderator: moderator || "unknown",
        time: Date.now()
    });

    console.log("Action queued:", action, target);

    res.json({ success: true });
});

// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on", PORT));
