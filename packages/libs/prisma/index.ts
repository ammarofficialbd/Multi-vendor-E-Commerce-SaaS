import { PrismaClient } from "@prisma/client";

// ✅ Extend the global type safely
declare global {
  // `undefined` is important to avoid type errors during first load
  var prismadb: PrismaClient | undefined;
}

// ✅ Reuse existing client in dev; new one in production
const prismadb = globalThis.prismadb || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismadb = prismadb;
}

// ✅ Use named export (more consistent with TypeScript ecosystem)
export { prismadb };
