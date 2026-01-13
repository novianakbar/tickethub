// Prisma config for PostgreSQL
import "dotenv/config";
import { defineConfig } from "prisma/config";

// Get database URL from environment
const getDatabaseUrl = () => {
  const url = process.env["DATABASE_URL"] || "";
  return url.replace("prisma+postgresql://", "postgresql://");
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});
