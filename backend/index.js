import express from "express";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";
import fs from 'fs';
import { randomUUID } from "crypto"; // högst upp i filen

dotenv.config(); // <--- laddar .env

// SSL configuration with optional certificate
const certPath = './supabase-root-ca.crt';
const sslConfig = fs.existsSync(certPath) 
  ? {
      rejectUnauthorized: true,
      ca: fs.readFileSync(certPath).toString(),
    }
  : {
      rejectUnauthorized: false, // For dev without certificate
    };

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});


const app = express();
app.use(cors());
app.use(express.json());

// --- API Key middleware ---
async function requireApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"]; // <-- hämtar från header

  if (!apiKey) {
    return res.status(401).json({ success: false, error: "Missing API key" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM customers WHERE api_key = $1",
      [apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid API key" });
    }

    req.customer = result.rows[0]; // 👈 spara customer på requesten
    next();
  } catch (err) {
    console.error("API key check error:", err);
    res.status(500).json({ success: false, error: "API key validation failed" });
  }
}


app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1");
    res.json({ status: "ok", db: result.rows });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ status: "db error", error: err.message });
  }
});

// 🔁 Regenerate API key for a customer
app.post("/customers/:id/regenerate-key", async (req, res) => {
  const { id } = req.params;

  try {
    const newKey = randomUUID();

    const result = await pool.query(
      "UPDATE customers SET api_key = $1 WHERE id = $2 RETURNING *",
      [newKey, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    res.json({
      success: true,
      message: "API key regenerated",
      customer: result.rows[0],
    });
  } catch (err) {
    console.error("Regenerate API key error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/leads", requireApiKey, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM leads WHERE customer_id = $1 ORDER BY created_at DESC",
      [req.customer.id]
    );
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

app.get("/leads/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM leads WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get lead error:", err);
    res.status(500).json({ error: "get lead error" });
  }
});


app.get("/stats", requireApiKey, async (req, res) => {
  try {
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM leads WHERE customer_id = $1",
      [req.customer.id]
    );

    const todayResult = await pool.query(
      `SELECT COUNT(*) 
       FROM leads 
       WHERE customer_id = $1 AND created_at >= CURRENT_DATE`,
      [req.customer.id]
    );

    const weekResult = await pool.query(
      `SELECT COUNT(*) 
       FROM leads 
       WHERE customer_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
      [req.customer.id]
    );

    res.json({
      total: Number(totalResult.rows[0].count),
      today: Number(todayResult.rows[0].count),
      last7Days: Number(weekResult.rows[0].count),
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "stats error" });
  }
});

app.put("/leads/:id/status", async (req, res) => {
  const { status } = req.body;

  try {
    const result = await pool.query(
      "UPDATE leads SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "update error" });
  }
});

app.post("/webhook/:source", requireApiKey, async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leads (name, email, phone, message, status, source, customer_id, created_at)
       VALUES ($1, $2, $3, $4, 'new', $5, $6, NOW())
       RETURNING *`,
      [name, email, phone || null, message, req.params.source, req.customer.id]
    );

    res.json({ success: true, lead: result.rows[0] });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


app.get("/me", async (req, res) => {
  try {
    // TEMP: vi tar första customer i tabellen
    const result = await pool.query("SELECT * FROM customers LIMIT 1");

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No customer found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "me error" });
  }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Backend running on port " + PORT));