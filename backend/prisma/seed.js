"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcrypt = require("bcrypt");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../src/generated/prisma/client");
const enums_1 = require("../src/generated/prisma/enums");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
    const password = bcrypt.hashSync('password123', 10);
    for (const [email, role] of [
        ['admin@test.com', enums_1.Role.ADMIN],
        ['curator@test.com', enums_1.Role.CURATOR],
        ['listener@test.com', enums_1.Role.LISTENER],
    ]) {
        await prisma.user.upsert({
            where: { email },
            update: {},
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
//# sourceMappingURL=seed.js.map