import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { provisionNewUser } from "../src/lib/provision";
import { seedGlobalContent } from "../src/lib/seed-runtime";

const db = new PrismaClient();

async function seedDemoUser() {
  const email = "jaylen@setischolar.dev";
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash("ad-astra-2026", 12);
  const user = await db.user.create({
    data: { name: "Jaylen Mays", email, passwordHash },
  });
  await provisionNewUser(user.id);
  console.log(`Demo user: ${email} / ad-astra-2026`);
  return user;
}

async function main() {
  console.log("Seeding learning content...");
  await seedGlobalContent(db);
  console.log("Seeding demo user...");
  await seedDemoUser();
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
