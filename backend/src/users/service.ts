import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, type Role } from '../db/schema';
import { SAFE_SELECT } from '../auth/current-user';

export abstract class UsersService {
  static async findById(id: number) {
    const [user] = await db.select(SAFE_SELECT).from(users).where(eq(users.id, id));
    return user;
  }

  static async updateRole(id: number, role: Role) {
    const [updated] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning(SAFE_SELECT);
    return updated;
  }
}
