import { Pool } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// ---------- helpers ----------
function renderTemplate(str, lead) {
  return (str || "")
    .replaceAll("{{name}}", lead.name || "")
    .replaceAll("{{email}}", lead.email || "")
    .replaceAll("{{phone}}", lead.phone || "")
    .replaceAll("{{message}}", lead.message || "");
}

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

async function processJob(job) {
  // step
  const stepRes = await pool.query("SELECT * FROM automation_steps WHERE id = $1", [
    job.step_id,
  ]);
  const step = stepRes.rows[0];
  if (!step) throw new Error("Step not found for job " + job.id);

  // lead
  const leadRes = await pool.query("SELECT * FROM leads WHERE id = $1", [
    job.lead_id,
  ]);
  const lead = leadRes.rows[0];
  if (!lead) throw new Error("Lead not found for job " + job.id);

  if (step.type === "wait") {
    // Wait step does nothing, just exists for timing
    return;
  }

  if (step.type === "email") {
    const cfg = step.config || {};
    const subject = renderTemplate(cfg.subject || "Thanks!", lead);
    const body = renderTemplate(cfg.body || "We will contact you soon.", lead);
    const to = lead.email;

    if (!process.env.RESEND_FROM_EMAIL) {
      throw new Error("Missing RESEND_FROM_EMAIL in env");
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      html: `<p>${body.replaceAll("\n", "<br/>")}</p>`,
    });

    await logEvent({
      customerId: job.customer_id,
      leadId: job.lead_id,
      jobId: job.id,
      stepId: job.step_id,
      eventType: "email_sent",
      message: `Email sent to ${to}`,
      meta: { to, subject },
    });

    return;
  }

  // Unknown step types (future)
  return;
}

async function runOnce() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const timeRes = await client.query("SELECT NOW() as now");
    console.log("DB NOW():", timeRes.rows[0].now);

    const jobsRes = await client.query(
      `
      SELECT *
      FROM automation_jobs
      WHERE status = 'pending' AND run_at <= NOW()
      ORDER BY run_at ASC
      LIMIT 10
      FOR UPDATE SKIP LOCKED
      `
    );

    console.log("Found due jobs:", jobsRes.rows.length);

    for (const job of jobsRes.rows) {
      try {
        await processJob(job);

        await client.query(
          "UPDATE automation_jobs SET status = 'done' WHERE id = $1",
          [job.id]
        );

        await logEvent({
          customerId: job.customer_id,
          leadId: job.lead_id,
          jobId: job.id,
          stepId: job.step_id,
          eventType: "job_done",
          message: "Job completed",
        });
      } catch (err) {
        console.error("❌ Job failed", job.id, err.message);

        await client.query(
          "UPDATE automation_jobs SET status = 'failed' WHERE id = $1",
          [job.id]
        );

        await logEvent({
          customerId: job.customer_id,
          leadId: job.lead_id,
          jobId: job.id,
          stepId: job.step_id,
          eventType: "job_failed",
          message: err.message,
        });
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Worker runOnce error:", err.message);
  } finally {
    client.release();
  }
}

console.log("🤖 Worker started. Polling every 5 seconds...");
setInterval(() => {
  runOnce().catch((err) => console.error("Worker loop error:", err));
}, 5000);
