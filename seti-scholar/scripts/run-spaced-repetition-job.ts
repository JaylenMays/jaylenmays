/**
 * Invokes the spaced-repetition/reminder job endpoint. Schedule with cron:
 *
 *   0 13 * * *  cd /path/to/seti-scholar && npm run jobs:spaced-repetition
 *
 * or hit POST /api/jobs/spaced-repetition from any scheduler (GitHub Actions,
 * Vercel Cron, systemd timer) with `Authorization: Bearer $JOBS_SECRET`.
 */

export {};

const url = `${process.env.APP_URL ?? "http://localhost:3000"}/api/jobs/spaced-repetition`;
const secret = process.env.JOBS_SECRET;

if (!secret) {
  console.error("JOBS_SECRET is not set");
  process.exit(1);
}

fetch(url, {
  method: "POST",
  headers: { Authorization: `Bearer ${secret}` },
})
  .then(async (res) => {
    const body = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(body));
    console.log("Spaced-repetition job:", body);
  })
  .catch((err) => {
    console.error("Job failed:", err);
    process.exit(1);
  });
