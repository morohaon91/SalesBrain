import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Check if demo data already exists
    const existingTenant = await prisma.tenant.findFirst({
      where: { businessName: "Demo Consulting" },
    });

    let tenant = existingTenant;

    if (!existingTenant) {
      // Create demo tenant
      tenant = await prisma.tenant.create({
        data: {
          businessName: "Demo Consulting",
          industry: "Business Consulting",
          website: "https://democonsulting.example.com",
          description:
            "A demo consulting firm for testing the Concierge platform",
          subscriptionTier: "TRIAL",
          subscriptionStatus: "ACTIVE",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          widgetEnabled: true,
          widgetGreeting: "Hi! What brings you here today?",
          aiTransparency: true,
          emailNotifications: true,
        },
      });
      console.log(`✅ Created tenant: ${tenant.businessName}`);
    } else {
      console.log(`✅ Tenant already exists: ${tenant.businessName}`);
    }

    // Create demo user
    const existingUser = await prisma.user.findUnique({
      where: { email: "demo@example.com" },
    });

    let user = existingUser;

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("Demo123!", 10);

      user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: "demo@example.com",
          password: hashedPassword,
          name: "Demo User",
          role: "OWNER",
          emailVerified: true,
        },
      });
      console.log(`✅ Created user: ${user.email}`);
    } else {
      console.log(`✅ User already exists: ${existingUser.email}`);
    }

    // Create business profile
    const existingProfile = await prisma.businessProfile.findUnique({
      where: { tenantId: tenant.id },
    });

    if (!existingProfile) {
      const profile = await prisma.businessProfile.create({
        data: {
          tenantId: tenant.id,
          isComplete: false,
          completionScore: 0,
          communicationStyle: {
            tone: "professional",
            formality: 4,
            responseLength: "detailed",
            emojiUsage: false,
            keyPhrases: [
              "Let's discuss",
              "Here's what I'm thinking",
              "What are your thoughts?",
            ],
          },
        },
      });
      console.log(`✅ Created business profile for tenant`);
    } else {
      console.log(`✅ Business profile already exists`);
    }

    console.log("\n✨ Database seed complete!");
    console.log("\n📋 Demo Credentials:");
    console.log("   Email: demo@example.com");
    console.log("   Password: Demo123!");
    console.log(`   Tenant ID: ${tenant.id}`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
