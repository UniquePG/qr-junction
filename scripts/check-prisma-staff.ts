import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
console.log("role", typeof p.restaurantRole);
console.log("staff", typeof p.restaurantStaff);
console.log("audit", typeof p.restaurantAuditLog);
await p.$disconnect();
