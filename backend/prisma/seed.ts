import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { Role } from '../src/generated/prisma/enums';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const password = bcrypt.hashSync('password123', 10);

  for (const [email, role] of [
    ['admin@test.com', Role.ADMIN],
    ['curator@test.com', Role.CURATOR],
    ['listener@test.com', Role.LISTENER],
  ] as const) {
    await prisma.user.upsert({
      where: { email },
      update: { role },
      create: { email, password, role },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
