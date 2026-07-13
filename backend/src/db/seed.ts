import { db } from './index';
import { users } from './schema';

const TEST_ACCOUNTS = [
  { email: 'admin@test.com', password: 'password123', role: 'ADMIN' as const },
  { email: 'curator@test.com', password: 'password123', role: 'CURATOR' as const },
  { email: 'listener@test.com', password: 'password123', role: 'LISTENER' as const },
];

async function seed() {
  for (const account of TEST_ACCOUNTS) {
    const password = await Bun.password.hash(account.password, { algorithm: 'bcrypt', cost: 10 });
    await db
      .insert(users)
      .values({ email: account.email, password, role: account.role })
      .onConflictDoNothing({ target: users.email });
  }
  console.log('Seed complete.');
}

seed();
