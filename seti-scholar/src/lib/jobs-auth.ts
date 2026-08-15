/**
 * Authorization for scheduled-job endpoints. Accepts either:
 *  - Authorization: Bearer <JOBS_SECRET>  (manual/cron scripts)
 *  - Authorization: Bearer <CRON_SECRET>  (Vercel Cron sets this automatically)
 *  - ?token=<JOBS_SECRET>                 (one-time browser bootstrap convenience)
 */
export function jobRequestAuthorized(req: Request): boolean {
  const jobsSecret = process.env.JOBS_SECRET;
  const cronSecret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization");

  if (jobsSecret && header === `Bearer ${jobsSecret}`) return true;
  if (cronSecret && header === `Bearer ${cronSecret}`) return true;

  if (jobsSecret) {
    try {
      const token = new URL(req.url).searchParams.get("token");
      if (token && token === jobsSecret) return true;
    } catch {
      // fall through
    }
  }
  return false;
}
