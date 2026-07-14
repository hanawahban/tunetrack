import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, type Role } from '../db/schema';
import { SAFE_SELECT } from '../auth/current-user';

export type UpdateRoleResult =
  | { outcome: 'not_found' }
  | { outcome: 'forbidden' }
  | { outcome: 'ok'; user: NonNullable<Awaited<ReturnType<typeof UsersService.findById>>> };

export abstract class UsersService {
  static async findById(id: number) {
    const [user] = await db.select(SAFE_SELECT).from(users).where(eq(users.id, id));
    return user;
  }

  /** Admins can't have their role changed -- covers both self-demotion and demoting other admins. */
  static async updateRole(id: number, role: Role): Promise<UpdateRoleResult> {
    const target = await UsersService.findById(id);
    if (!target) return { outcome: 'not_found' };
    if (target.role === 'ADMIN') return { outcome: 'forbidden' };

    const [updated] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning(SAFE_SELECT);
    return { outcome: 'ok', user: updated! };
  }
}
