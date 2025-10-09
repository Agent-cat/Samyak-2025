import dotenv from "dotenv";
dotenv.config();
import redisClient from "../redisClient.js";
import { sendCertificateEmail } from "../utils/emailService.js";

const EMAIL_QUEUE_KEY = process.env.EMAIL_QUEUE_KEY || "queue:emails";
const VISIBILITY_TIMEOUT_MS = 60_000; // basic visibility emulation window

async function processJob(jobStr) {
  let job;
  try {
    job = JSON.parse(jobStr);
  } catch (e) {
    console.error("Invalid job JSON, dropping:", jobStr);
    return;
  }
  if (!job || job.type !== "certificate") return;

  const { toEmail, fullName, college, collegeId, eventTitle } = job.payload || {};
  if (!toEmail) return;
  try {
    await sendCertificateEmail({ toEmail, fullName, college, collegeId, eventTitle });
  } catch (e) {
    console.error("sendCertificateEmail failed:", e);
  }
}

async function run() {
  console.log("Email worker started. Waiting for jobs...");
  while (true) {
    try {
      // BLPOP blocks until an item is available
      const res = await redisClient.blpop(EMAIL_QUEUE_KEY, 0);
      if (!res) continue;
      const [, jobStr] = res; // [key, value]

      // Optional: Push to a processing list for visibility timeout semantics
      const processingKey = `${EMAIL_QUEUE_KEY}:processing`;
      await redisClient.rpush(processingKey, JSON.stringify({ jobStr, ts: Date.now() }));

      const start = Date.now();
      await processJob(jobStr);
      const duration = Date.now() - start;
      console.log(`Processed email job in ${duration}ms`);

      // Remove from processing (best-effort)
      await redisClient.lrem(processingKey, 1, JSON.stringify({ jobStr, ts: start }));
    } catch (e) {
      console.error("Email worker loop error:", e);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

run().catch((e) => {
  console.error("Email worker failed to start:", e);
  process.exit(1);
});


