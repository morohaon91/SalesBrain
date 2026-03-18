import { PrismaClient, LeadStatus, ConversationStatus, SimulationStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDemoData() {
  try {
    console.log("🌱 Seeding demo data...");

    // Find demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@example.com" },
      include: { tenant: true },
    });

    if (!demoUser) {
      console.log("❌ Demo user not found. Create user with email: demo@example.com");
      return;
    }

    const tenantId = demoUser.tenantId;
    console.log(`✅ Found demo user: ${demoUser.email}`);
    console.log(`   Tenant ID: ${tenantId}`);

    // Delete existing demo data for this tenant
    await prisma.lead.deleteMany({ where: { tenantId } });
    await prisma.conversation.deleteMany({ where: { tenantId } });
    await prisma.simulation.deleteMany({ where: { tenantId } });
    console.log("🗑️  Cleared existing demo data");

    // Create mock leads first
    const leads = await Promise.all([
      prisma.lead.create({
        data: {
          tenantId,
          name: "Sarah Johnson",
          email: "sarah@startup.com",
          company: "TechStart Inc",
          phone: "+1-555-0123",
          status: LeadStatus.QUALIFIED,
          qualificationScore: 85,
          budget: "$10k-25k",
          timeline: "3-6 months",
          ownerViewed: true,
          ownerNotes: "High potential, follow up this week",
          firstContactAt: new Date("2026-03-17"),
          lastContactAt: new Date("2026-03-17"),
        },
      }),
      prisma.lead.create({
        data: {
          tenantId,
          name: "Michael Chen",
          email: "michael@techco.com",
          company: "Tech Solutions Corp",
          phone: "+1-555-0456",
          status: LeadStatus.CONTACTED,
          qualificationScore: 72,
          budget: "$5k-15k",
          timeline: "1-3 months",
          ownerViewed: true,
          ownerNotes: "Budget conscious but interested",
          firstContactAt: new Date("2026-03-16"),
          lastContactAt: new Date("2026-03-16"),
        },
      }),
      prisma.lead.create({
        data: {
          tenantId,
          name: "Emma Davis",
          email: "emma@consultancy.io",
          company: "Consultancy Partners",
          phone: "+1-555-0789",
          status: LeadStatus.QUALIFIED,
          qualificationScore: 78,
          budget: "$25k+",
          timeline: "6-12 months",
          ownerViewed: false,
          firstContactAt: new Date("2026-03-16"),
          lastContactAt: new Date("2026-03-16"),
        },
      }),
    ]);

    console.log(`✅ Created ${leads.length} demo leads`);

    // Create mock conversations linked to leads
    const conversations = await Promise.all([
      prisma.conversation.create({
        data: {
          tenantId,
          leadId: leads[0].id,
          sessionId: "session-001",
          status: ConversationStatus.ENDED,
          leadScore: 85,
          createdAt: new Date("2026-03-17"),
          lastActivityAt: new Date("2026-03-17"),
        },
      }),
      prisma.conversation.create({
        data: {
          tenantId,
          leadId: leads[1].id,
          sessionId: "session-002",
          status: ConversationStatus.ACTIVE,
          leadScore: 72,
          createdAt: new Date("2026-03-16"),
          lastActivityAt: new Date("2026-03-16"),
        },
      }),
      prisma.conversation.create({
        data: {
          tenantId,
          leadId: leads[2].id,
          sessionId: "session-003",
          status: ConversationStatus.ENDED,
          leadScore: 78,
          createdAt: new Date("2026-03-15"),
          lastActivityAt: new Date("2026-03-15"),
        },
      }),
    ]);

    console.log(`✅ Created ${conversations.length} demo conversations`);

    // Create mock simulations
    const simulations = await Promise.all([
      prisma.simulation.create({
        data: {
          tenantId,
          scenarioType: "PRICE_SENSITIVE",
          status: SimulationStatus.COMPLETED,
          duration: 1845,
          qualityScore: 85,
          completedAt: new Date("2026-03-15"),
          aiPersona: { confidence: 0.87, accuracy: 0.82 },
        },
      }),
      prisma.simulation.create({
        data: {
          tenantId,
          scenarioType: "TIME_PRESSURED",
          status: SimulationStatus.COMPLETED,
          duration: 1240,
          qualityScore: 72,
          completedAt: new Date("2026-03-14"),
          aiPersona: { confidence: 0.75, accuracy: 0.78 },
        },
      }),
      prisma.simulation.create({
        data: {
          tenantId,
          scenarioType: "HIGH_BUDGET",
          status: SimulationStatus.COMPLETED,
          duration: 2100,
          qualityScore: 78,
          completedAt: new Date("2026-03-13"),
          aiPersona: { confidence: 0.80, accuracy: 0.85 },
        },
      }),
    ]);

    console.log(`✅ Created ${simulations.length} demo simulations`);

    console.log("✅ Demo data seeded successfully!");
    console.log("");
    console.log("Demo user stats:");
    console.log(`  - Leads: ${leads.length}`);
    console.log(`  - Conversations: ${conversations.length}`);
    console.log(`  - Simulations: ${simulations.length}`);
  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoData();
