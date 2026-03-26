'use client';

import { Card } from '@/components/ui/card';

interface ProfilePreviewProps {
  profile: Record<string, any>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  if (!items?.length) return <p className="text-sm text-gray-400 italic">Not set</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.slice(0, 5).map((item, i) => (
        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
          {item}
        </span>
      ))}
      {items.length > 5 && (
        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">+{items.length - 5} more</span>
      )}
    </div>
  );
}

export default function ProfilePreview({ profile }: ProfilePreviewProps) {
  const cs = profile.communicationStyle;
  const pl = profile.pricingLogic;
  const qc = profile.qualificationCriteria;
  const oh = profile.objectionHandling;

  return (
    <div className="space-y-6">
      {/* Business Info */}
      <Section title="Business Information">
        <Card className="p-4 space-y-2 text-sm">
          <div><span className="text-gray-500">Industry:</span> <span className="font-medium">{profile.industry ?? '—'}</span></div>
          <div><span className="text-gray-500">Service Area:</span> <span className="font-medium">{profile.serviceArea ?? '—'}</span></div>
          <div><span className="text-gray-500">Team Size:</span> <span className="font-medium">{profile.teamSize ?? '—'}</span></div>
          {profile.yearsExperience && (
            <div><span className="text-gray-500">Experience:</span> <span className="font-medium">{profile.yearsExperience} years</span></div>
          )}
        </Card>
      </Section>

      {/* Communication Style */}
      {cs && (
        <Section title="Communication Style">
          <Card className="p-4 space-y-2 text-sm">
            <div><span className="text-gray-500">Tone:</span> <span className="font-medium capitalize">{cs.tone}</span></div>
            <div><span className="text-gray-500">Style:</span> <span className="font-medium capitalize">{cs.style}</span></div>
            <div className="pt-1"><TagList items={cs.keyPhrases ?? []} /></div>
          </Card>
        </Section>
      )}

      {/* Pricing Logic */}
      {pl && (
        <Section title="Pricing Logic">
          <Card className="p-4 space-y-2 text-sm">
            {(pl.minBudget || pl.typicalRange) && (
              <div><span className="text-gray-500">Budget Range:</span> <span className="font-medium">{pl.typicalRange ?? `$${pl.minBudget?.toLocaleString()} - $${pl.maxBudget?.toLocaleString()}`}</span></div>
            )}
            <div><span className="text-gray-500">Flexibility:</span> <TagList items={pl.flexibilityFactors ?? []} /></div>
            <div><span className="text-gray-500">Deal-Breakers:</span> <TagList items={pl.dealBreakers ?? []} /></div>
          </Card>
        </Section>
      )}

      {/* Qualification */}
      {qc && (
        <Section title="Qualification Criteria">
          <Card className="p-4 space-y-3 text-sm">
            <div><span className="text-gray-500 block mb-1">Must-Haves:</span><TagList items={qc.mustHaves ?? []} /></div>
            <div><span className="text-gray-500 block mb-1">Green Flags:</span><TagList items={qc.greenFlags ?? []} /></div>
            <div><span className="text-gray-500 block mb-1">Deal-Breakers:</span><TagList items={qc.dealBreakers ?? []} /></div>
          </Card>
        </Section>
      )}
    </div>
  );
}
