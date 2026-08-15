# Deploying SETI Scholar (≈15 minutes, no local tools needed)

Everything below happens in your browser. When you're done you'll have a permanent
`https://…vercel.app` URL that works from any device, including your phone.

## 1. Create the database — Neon (free)

1. Go to **[neon.tech](https://neon.tech)** → Sign up (use your GitHub account for one-click signup).
2. Create a project — name it `seti-scholar`, pick the region closest to you (e.g. AWS us-west-2).
3. On the project dashboard, click **Connect** and copy the **connection string**. It looks like:
   `postgresql://neondb_owner:xxxx@ep-xxxx.us-west-2.aws.neon.tech/neondb?sslmode=require`
4. Keep that tab open — you'll paste this string in step 2.

## 2. Deploy the app — Vercel (free)

1. Go to **[vercel.com](https://vercel.com)** → Sign up **with your GitHub account** (this lets Vercel see your repos).
2. Click **Add New… → Project** → Import **`JaylenMays/jaylenmays`**.
3. Configure the project **before** clicking Deploy:
   - **Root Directory**: click *Edit* and set it to **`seti-scholar`** (the app lives in this subfolder — this step matters).
   - **Framework Preset**: Next.js (auto-detected).
   - Under **Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the Neon connection string from step 1 (keep `?sslmode=require`) |
   | `AUTH_SECRET` | any long random string — 40+ characters of keyboard mashing is fine |
   | `AUTH_TRUST_HOST` | `true` |
   | `JOBS_SECRET` | another long random string (different from AUTH_SECRET) |
   | `CRON_SECRET` | another long random string — Vercel Cron uses this automatically |
   | `ANTHROPIC_API_KEY` | *(optional)* your key from console.anthropic.com — turns on the full AI tutor & lesson writer |

4. If the repo is deployed from a branch: after the first deploy, go to
   **Settings → Git → Production Branch** and set it to `claude/seti-scholar-app-lsb3l3`
   (or merge that branch to `main` first — then skip this).
5. Click **Deploy** and wait ~2 minutes. The build automatically creates the database tables
   (`prisma db push` runs during the build — see `vercel.json`).

## 3. Load the learning content (one browser visit)

Open this URL once, substituting your own values:

```
https://YOUR-APP.vercel.app/api/jobs/bootstrap?token=YOUR_JOBS_SECRET
```

You should see a JSON response like `{"ok":true,"modules":20,"lessons":33,…}`.
That seeds all modules, lessons, question banks, and coding challenges. It's idempotent —
safe to visit again after future updates.

## 4. Create your account

Go to `https://YOUR-APP.vercel.app/register` and sign up. Your account is automatically
provisioned with:

- the **official ASU LAASTPLABS degree plan** (from your eAdvisor/DARS import), with your
  11 transfer credits recorded and **MAT 265 already set as the current focus**
- all six degree paths, career milestones, starter flashcards, and the seeded research project

Then visit **Course Builder** and hit *Build curriculum* on MAT 265 — or just wait: the
nightly autonomy cron builds curricula for your upcoming courses automatically.

## What runs on a schedule (already configured)

`vercel.json` registers two Vercel Cron jobs, authorized via `CRON_SECRET`:

- **05:00 UTC daily** — `/api/jobs/autonomy`: builds curricula for upcoming courses,
  refreshes stale sources, generates remediation lessons, schedules the next study session,
  posts readiness notices.
- **13:00 UTC daily** — `/api/jobs/spaced-repetition`: creates review reminders when
  flashcards come due.

> Note: Vercel's free (Hobby) tier allows daily cron jobs — these two are within limits.

## Troubleshooting

- **Build fails with a database error** → check `DATABASE_URL` has `?sslmode=require` and
  no stray spaces.
- **404 on the app but the deploy succeeded** → Root Directory wasn't set to `seti-scholar`;
  fix it in Settings → General and redeploy.
- **Bootstrap returns `{"error":"Unauthorized"}`** → the `token=` value must match
  `JOBS_SECRET` exactly.
- **Tutor says "offline mode"** → add `ANTHROPIC_API_KEY` in Vercel → Settings →
  Environment Variables, then redeploy.
- **Sign-in loops back to login** → confirm `AUTH_SECRET` and `AUTH_TRUST_HOST=true` are set.
