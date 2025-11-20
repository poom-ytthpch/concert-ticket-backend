import { Prisma, PrismaClient, RoleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
export async function seedUserData(
  prisma: PrismaClient<Prisma.PrismaClientOptions>,
) {
  const users = [
    {
      email: 'root@root.com',
      username: 'root',
      password: 'rootpassword',
      roles: [RoleType.ROOT],
    },
  ];

  console.log('Seeding user data...');

  for (const userData of users) {
    const roleCreate: Prisma.RoleCreateManyUserInputEnvelope = {
      data: userData.roles.map((role) => ({
        type: role,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };

    const hash = await bcrypt.hash(userData.password, 10);

    await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: hash,
        roles: {
          createMany: roleCreate,
        },
      },
    });
  }

  console.log('User data seeded.');
}
