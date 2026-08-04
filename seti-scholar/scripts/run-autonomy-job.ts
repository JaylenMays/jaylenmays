/**
 * Invokes the continuous-autonomy endpoint: builds curricula for upcoming
 * courses, refreshes stale sources, generates remediation lessons, schedules
 * the next study session, and posts readiness notices.
 *
 *   0 5 * * *  cd /path/to/seti-scholar && npm run jobs:autonomy
 */

export {};

const url = `${process.env.APP_URL ?? "http://localhost:3000"}/api/jobs/autonomy`;
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
    console.log("Autonomy job:", body);
  })
  .catch((err) => {
    console.error("Job failed:", err);
    process.exit(1);
  });
