import express from "express";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config(); // <--- laddar .env

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "development" ? { rejectUnauthorized: false } : false
});


const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1");
    res.json({ status: "ok", db: result.rows });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ status: "db error", error: err.message });
  }
});

app.get("/leads", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM leads ORDER BY created_at DESC");
    res.json({ success: true, leads: result.rows });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/leads", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Name, email and message are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO leads (name, email, phone, message, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
      [name, email, phone, message, "new"]
    );
    res.json({ success: true, lead: result.rows[0] });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});




const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Backend running on port " + PORT));