import { prisma } from '../db.js';
import type { User } from '@prisma/client';

export class UserRepository {
  public async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  public async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  public async create(data: { email: string; name?: string | null; passwordHash: string }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }
}
export const userRepository = new UserRepository();
