import { prisma } from '../lib/prisma';
import { updateProfileReadiness } from '../lib/learning/readiness-calculator';

async function backfill() {
  const profiles = await prisma.businessProfile.findMany({
    select: { id: true },
  });

  console.log(`Backfilling ${profiles.length} profiles...`);

  for (const p of profiles) {
    try {
      await updateProfileReadiness(p.id);
      console.log(`✓ ${p.id}`);
    } catch (err) {
      console.error(`✗ ${p.id}`, err);
    }
  }

  console.log('Done.');
  await prisma.$disconnect();
}

backfill();
