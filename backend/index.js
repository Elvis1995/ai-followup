import express from "express";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import { randomUUID } from "crypto";

dotenv.config();

// ---------- SSL (Supabase) ----------
const certPath = "./supabase-root-ca.crt";
const sslConfig = fs.existsSync(certPath)
  ? {
      rejectUnauthorized: true,
      ca: fs.readFileSync(certPath).toString(),
    }
  : {
      rejectUnauthorized: false,
    };

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});

// ---------- App ----------
const app = express();
app.use(cors());
app.use(express.json());

// ---------- API Key middleware ----------
async function requireApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ success: false, error: "Missing API key" });
  }

  try {
    const result = await pool.query("SELECT * FROM customers WHERE api_key = $1", [
      apiKey,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid API key" });
    }

    req.customer = result.rows[0];
    next();
  } catch (err) {
    console.error("API key check error:", err);
    res
      .status(500)
      .json({ success: false, error: "API key validation failed" });
  }
}

// ---------- Activity logger ----------
async function logEvent({
  customerId,
  leadId,
  jobId = null,
  stepId = null,
  eventType,
  message = null,
  meta = {},
}) {
  await pool.query(
    `
    INSERT INTO automation_events (customer_id, lead_id, job_id, step_id, event_type, message, meta)
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    `,
    [customerId, leadId, jobId, stepId, eventType, message, JSON.stringify(meta)]
  );
}

// ---------- Automation trigger ----------
async function triggerAutomationForLead(lead) {
  // 1) active flows for this customer + trigger
  const flowsRes = await pool.query(
    `
    SELECT *
    FROM automation_flows
    WHERE customer_id = $1 AND trigger = 'new_lead' AND is_active = true
    `,
    [lead.customer_id]
  );

  for (const flow of flowsRes.rows) {
    // 2) steps ordered
    const stepsRes = await pool.query(
      `
      SELECT *
      FROM automation_steps
      WHERE flow_id = $1
      ORDER BY step_order ASC
      `,
      [flow.id]
    );

    let totalDelayMinutes = 0;

    for (const step of stepsRes.rows) {
      totalDelayMinutes += Number(step.delay_minutes || 0);

      // 3) create job (DB decides run_at)
      const jobRes = await pool.query(
        `
        INSERT INTO automation_jobs (customer_id, lead_id, flow_id, step_id, run_at, status)
        VALUES ($1, $2, $3, $4, NOW() + ($5 || ' minutes')::interval, 'pending')
        RETURNING *
        `,
        [lead.customer_id, lead.id, flow.id, step.id, totalDelayMinutes]
      );

      const job = jobRes.rows[0];

      // 4) log event
      await logEvent({
        customerId: lead.customer_id,
        leadId: lead.id,
        jobId: job.id,
        stepId: step.id,
        eventType: "job_created",
        message: `Job created for step "${step.type}"`,
        meta: {
          flow_id: flow.id,
          flow_name: flow.name,
          trigger: flow.trigger,
          step_type: step.type,
          step_order: step.step_order,
          delay_minutes: step.delay_minutes || 0,
          total_delay_minutes: totalDelayMinutes,
          run_at: job.run_at,
        },
      });
    }
  }
}

// ---------- Routes ----------
app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now, 1 as ok");
    res.json({ status: "ok", db: result.rows });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ status: "db error", error: err.message });
  }
});

// DEV bootstrap: returns first customer (no api key required)
// Later: replace with real login/session auth
app.get("/me", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers ORDER BY created_at ASC LIMIT 1");

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "No customer found" });
    }

    res.json({ success: true, customer: result.rows[0] });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ success: false, error: "me error" });
  }
});


// Regenerate API key
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

// Leads list (tenant-safe)
app.get("/leads", requireApiKey, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM leads WHERE customer_id = $1 ORDER BY created_at DESC",
      [req.customer.id]
    );
    res.json({ success: true, leads: result.rows });
  } catch (err) {
    console.error("Leads error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create lead manually (tenant-safe)
app.post("/leads", requireApiKey, async (req, res) => {
  const { name, email, phone, message, source = "manual" } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, error: "name, email, message are required" });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO leads (customer_id, name, email, phone, message, status, source, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'new', $6, NOW(), NOW())
      RETURNING *
      `,
      [req.customer.id, name, email, phone || null, message, source]
    );

    const lead = result.rows[0];

    // trigger automations
    await triggerAutomationForLead(lead);

    res.json({ success: true, lead });
  } catch (err) {
    console.error("Create lead error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get lead (tenant-safe)
app.get("/leads/:id", requireApiKey, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM leads WHERE id = $1 AND customer_id = $2",
      [req.params.id, req.customer.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    res.json({ success: true, lead: result.rows[0] });
  } catch (err) {
    console.error("Get lead error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Update lead status (tenant-safe)
app.put("/leads/:id/status", requireApiKey, async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: "Missing status" });
  }

  try {
    const result = await pool.query(
      `
      UPDATE leads
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND customer_id = $3
      RETURNING *
      `,
      [status, req.params.id, req.customer.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    res.json({ success: true, lead: result.rows[0] });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Stats (tenant-safe)
app.get("/stats", requireApiKey, async (req, res) => {
  try {
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM leads WHERE customer_id = $1",
      [req.customer.id]
    );

    const todayResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM leads
      WHERE customer_id = $1 AND created_at >= CURRENT_DATE
      `,
      [req.customer.id]
    );

    const weekResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM leads
      WHERE customer_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
      `,
      [req.customer.id]
    );

    res.json({
      success: true,
      total: Number(totalResult.rows[0].count),
      today: Number(todayResult.rows[0].count),
      last7Days: Number(weekResult.rows[0].count),
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Webhook ingestion (tenant-safe via x-api-key)
app.post("/webhook/:source", requireApiKey, async (req, res) => {
  const { name, email, phone, message, external_id = null } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    const leadRes = await pool.query(
      `
      INSERT INTO leads (customer_id, name, email, phone, message, status, source, external_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'new', $6, $7, NOW(), NOW())
      RETURNING *
      `,
      [
        req.customer.id,
        name,
        email,
        phone || null,
        message,
        req.params.source,
        external_id,
      ]
    );

    const lead = leadRes.rows[0];

    await triggerAutomationForLead(lead);

    res.json({ success: true, lead });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lead activity (events + jobs) tenant-safe
app.get("/leads/:id/activity", requireApiKey, async (req, res) => {
  try {
    const leadCheck = await pool.query(
      "SELECT id FROM leads WHERE id = $1 AND customer_id = $2",
      [req.params.id, req.customer.id]
    );
    if (leadCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    const eventsRes = await pool.query(
      `
      SELECT *
      FROM automation_events
      WHERE lead_id = $1 AND customer_id = $2
      ORDER BY created_at DESC
      LIMIT 200
      `,
      [req.params.id, req.customer.id]
    );

    const jobsRes = await pool.query(
      `
      SELECT j.*, s.type as step_type, s.step_order
      FROM automation_jobs j
      LEFT JOIN automation_steps s ON s.id = j.step_id
      WHERE j.lead_id = $1 AND j.customer_id = $2
      ORDER BY j.run_at DESC
      LIMIT 200
      `,
      [req.params.id, req.customer.id]
    );

    res.json({ success: true, events: eventsRes.rows, jobs: jobsRes.rows });
  } catch (err) {
    console.error("Activity error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- Automation API (tenant-safe) ----------------

// GET /automation/flows  (inkl steps)
app.get("/automation/flows", requireApiKey, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        f.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'flow_id', s.flow_id,
              'step_order', s.step_order,
              'type', s.type,
              'delay_minutes', s.delay_minutes,
              'config', s.config
            )
            ORDER BY s.step_order ASC
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) AS steps
      FROM automation_flows f
      LEFT JOIN automation_steps s ON s.flow_id = f.id
      WHERE f.customer_id = $1
      GROUP BY f.id
      ORDER BY f.created_at DESC
      `,
      [req.customer.id]
    );

    res.json({ success: true, flows: result.rows });
  } catch (err) {
    console.error("Get flows error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /automation/flows
app.post("/automation/flows", requireApiKey, async (req, res) => {
  const { name, trigger = "new_lead", is_active = true } = req.body || {};

  if (!name?.trim()) {
    return res.status(400).json({ success: false, error: "Missing name" });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO automation_flows (customer_id, name, trigger, is_active, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
      `,
      [req.customer.id, name.trim(), trigger, !!is_active]
    );

    res.json({ success: true, flow: result.rows[0] });
  } catch (err) {
    console.error("Create flow error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /automation/flows/:id
app.put("/automation/flows/:id", requireApiKey, async (req, res) => {
  const { id } = req.params;
  const { name, trigger, is_active } = req.body || {};

  try {
    const result = await pool.query(
      `
      UPDATE automation_flows
      SET
        name = COALESCE($1, name),
        trigger = COALESCE($2, trigger),
        is_active = COALESCE($3, is_active)
      WHERE id = $4 AND customer_id = $5
      RETURNING *
      `,
      [
        name ?? null,
        trigger ?? null,
        typeof is_active === "boolean" ? is_active : null,
        id,
        req.customer.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Flow not found" });
    }

    res.json({ success: true, flow: result.rows[0] });
  } catch (err) {
    console.error("Update flow error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /automation/flows/:id (tar steps först)
app.delete("/automation/flows/:id", requireApiKey, async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const flowRes = await client.query(
      `SELECT id FROM automation_flows WHERE id = $1 AND customer_id = $2`,
      [id, req.customer.id]
    );
    if (flowRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: "Flow not found" });
    }

    await client.query(`DELETE FROM automation_steps WHERE flow_id = $1`, [id]);
    await client.query(`DELETE FROM automation_flows WHERE id = $1 AND customer_id = $2`, [
      id,
      req.customer.id,
    ]);

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Delete flow error:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// GET /automation/flows/:id/steps
app.get("/automation/flows/:id/steps", requireApiKey, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT s.*
      FROM automation_steps s
      JOIN automation_flows f ON f.id = s.flow_id
      WHERE s.flow_id = $1 AND f.customer_id = $2
      ORDER BY s.step_order ASC
      `,
      [id, req.customer.id]
    );

    res.json({ success: true, steps: result.rows });
  } catch (err) {
    console.error("Get steps error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /automation/flows/:id/steps (append sist)
app.post("/automation/flows/:id/steps", requireApiKey, async (req, res) => {
  const { id } = req.params;
  const { type, delay_minutes = 0, config = {} } = req.body || {};

  if (!type) return res.status(400).json({ success: false, error: "Missing type" });

  try {
    const flowRes = await pool.query(
      `SELECT id FROM automation_flows WHERE id = $1 AND customer_id = $2`,
      [id, req.customer.id]
    );
    if (flowRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Flow not found" });
    }

    const orderRes = await pool.query(
      `SELECT COALESCE(MAX(step_order), 0) AS max_order FROM automation_steps WHERE flow_id = $1`,
      [id]
    );
    const nextOrder = Number(orderRes.rows[0].max_order) + 1;

    const result = await pool.query(
      `
      INSERT INTO automation_steps (flow_id, step_order, type, delay_minutes, config)
      VALUES ($1, $2, $3, $4, $5::jsonb)
      RETURNING *
      `,
      [id, nextOrder, type, Number(delay_minutes || 0), JSON.stringify(config || {})]
    );

    res.json({ success: true, step: result.rows[0] });
  } catch (err) {
    console.error("Create step error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /automation/steps/:id
app.put("/automation/steps/:id", requireApiKey, async (req, res) => {
  const { id } = req.params;
  const { type, delay_minutes, config } = req.body || {};

  try {
    const result = await pool.query(
      `
      UPDATE automation_steps s
      SET
        type = COALESCE($1, s.type),
        delay_minutes = COALESCE($2, s.delay_minutes),
        config = COALESCE($3::jsonb, s.config)
      FROM automation_flows f
      WHERE s.id = $4 AND s.flow_id = f.id AND f.customer_id = $5
      RETURNING s.*
      `,
      [
        type ?? null,
        typeof delay_minutes === "number" ? delay_minutes : null,
        config ? JSON.stringify(config) : null,
        id,
        req.customer.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Step not found" });
    }

    res.json({ success: true, step: result.rows[0] });
  } catch (err) {
    console.error("Update step error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /automation/steps/:id
app.delete("/automation/steps/:id", requireApiKey, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      DELETE FROM automation_steps s
      USING automation_flows f
      WHERE s.id = $1 AND s.flow_id = f.id AND f.customer_id = $2
      RETURNING s.*
      `,
      [id, req.customer.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Step not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete step error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /automation/flows/:id/steps/reorder
app.post("/automation/flows/:id/steps/reorder", requireApiKey, async (req, res) => {
  const { id } = req.params;
  const { orderedStepIds } = req.body || {};

  if (!Array.isArray(orderedStepIds) || orderedStepIds.length === 0) {
    return res.status(400).json({ success: false, error: "orderedStepIds required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const flowRes = await client.query(
      `SELECT id FROM automation_flows WHERE id = $1 AND customer_id = $2`,
      [id, req.customer.id]
    );
    if (flowRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: "Flow not found" });
    }

    const stepsRes = await client.query(`SELECT id FROM automation_steps WHERE flow_id = $1`, [id]);
    const allowed = new Set(stepsRes.rows.map((r) => r.id));
    for (const stepId of orderedStepIds) {
      if (!allowed.has(stepId)) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, error: "Invalid step id in reorder" });
      }
    }

    for (let i = 0; i < orderedStepIds.length; i++) {
      await client.query(`UPDATE automation_steps SET step_order = $1 WHERE id = $2`, [
        i + 1,
        orderedStepIds[i],
      ]);
    }

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Reorder steps error:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Backend running on port " + PORT));
