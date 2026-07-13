import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, type Role } from '../db/schema';
import { SAFE_SELECT } from '../auth/current-user';

export abstract class UsersService {
  static async updateRole(id: number, role: Role) {
    const [updated] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning(SAFE_SELECT);
    return updated;
  }
}
