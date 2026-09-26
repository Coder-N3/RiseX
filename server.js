const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = 3000;

// API
app.get("/api/opportunities", async (req, res) => {
    try {
        const response = await fetch(
            "https://brabble.ai/api/listings?limit=50",
            {
                headers: {
                    "x-api-key": process.env.BRABBLE_API_KEY
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Could not fetch opportunities"
        });
    }
});

// Open login page first // not working for now fix it later 
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// Serve frontend
app.use(express.static("."));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});