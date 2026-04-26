import "./load-env";

import bcrypt from "bcryptjs";
import { PrismaClient, PlatformAdminRole } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error"],
});

async function main() {
  console.log("🌱 Creating platform admin user...");

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.platformAdmin.findUnique({
      where: { email: "admin@salesbrain.local" },
    });

    if (existingAdmin) {
      console.log("✅ Platform admin already exists");
      return;
    }

    const password = await bcrypt.hash("SuperSecurePassword123!", 10);

    const superAdmin = await prisma.platformAdmin.create({
      data: {
        email: "admin@salesbrain.local",
        password,
        name: "Super Admin",
        role: "SUPER_ADMIN" as PlatformAdminRole,
        emailVerified: true,
        isActive: true,
        permissions: {
          canViewAllTenants: true,
          canManageSubscriptions: true,
          canImpersonate: true,
          canBanTenants: true,
          canViewAnalytics: true,
          canManageBilling: true,
          canAccessSupport: true,
        },
      },
    });

    console.log("✅ Platform Admin Created!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Email: ${superAdmin.email}`);
    console.log("Password: SuperSecurePassword123!");
    console.log(`Role: ${superAdmin.role}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!");

    // Create initial audit log entry
    await prisma.platformAuditLog.create({
      data: {
        adminId: superAdmin.id,
        action: "LOGGED_IN",
        description: "Platform admin account created via seed script",
        metadata: {
          createdBy: "seed script",
        },
      },
    });

    // Create platform settings
    await prisma.platformSettings.create({
      data: {
        maintenanceMode: false,
        signupsEnabled: true,
        defaultTrialDays: 14,
        aiCostBudget: 1000.0,
        supportEmail: "support@salesbrain.local",
        updatedBy: superAdmin.id,
      },
    });

    console.log("✅ Platform settings initialized!");
    console.log("\n✨ Platform Admin setup complete!\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
