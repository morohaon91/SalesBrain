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

  const flagLabels = (flags: any[]) => (flags ?? []).map((f) => f.flagType || f.description).filter(Boolean);
  const dealBreakerLabels = (dbs: any[]) => (dbs ?? []).map((d) => d.rule).filter(Boolean);
  const playbookLabels = (pbs: any[]) => (pbs ?? []).map((p) => p.objectionType).filter(Boolean);

  return (
    <div className="space-y-6">
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

      {cs && (
        <Section title="Communication Style">
          <Card className="p-4 space-y-2 text-sm">
            <div><span className="text-gray-500">Tone:</span> <span className="font-medium capitalize">{cs.tone ?? '—'}</span></div>
            <div><span className="text-gray-500">Energy:</span> <span className="font-medium capitalize">{cs.energyLevel ?? '—'}</span></div>
            <div><span className="text-gray-500">Verbosity:</span> <span className="font-medium capitalize">{cs.verbosityPattern ?? '—'}</span></div>
            <div className="pt-1"><span className="text-gray-500 block mb-1">Common Phrases:</span><TagList items={cs.commonPhrases ?? []} /></div>
          </Card>
        </Section>
      )}

      {pl && (
        <Section title="Pricing Logic">
          <Card className="p-4 space-y-2 text-sm">
            {(pl.minimumBudget || pl.preferredBudgetRange) && (
              <div>
                <span className="text-gray-500">Budget:</span>{' '}
                <span className="font-medium">
                  {pl.preferredBudgetRange ?? `$${pl.minimumBudget?.toLocaleString()}+`}
                </span>
              </div>
            )}
            <div><span className="text-gray-500 block mb-1">Flexible On:</span><TagList items={pl.flexibleOn ?? []} /></div>
            <div><span className="text-gray-500 block mb-1">Not Flexible On:</span><TagList items={pl.notFlexibleOn ?? []} /></div>
          </Card>
        </Section>
      )}

      {qc && (
        <Section title="Qualification Criteria">
          <Card className="p-4 space-y-3 text-sm">
            <div><span className="text-gray-500 block mb-1">Green Flags:</span><TagList items={flagLabels(qc.greenFlags)} /></div>
            <div><span className="text-gray-500 block mb-1">Red Flags:</span><TagList items={flagLabels(qc.redFlags)} /></div>
            <div><span className="text-gray-500 block mb-1">Deal-Breakers:</span><TagList items={dealBreakerLabels(qc.dealBreakers)} /></div>
          </Card>
        </Section>
      )}

      {oh && (
        <Section title="Objection Handling">
          <Card className="p-4 text-sm">
            <div><span className="text-gray-500 block mb-1">Playbooks:</span><TagList items={playbookLabels(oh.playbooks)} /></div>
          </Card>
        </Section>
      )}
    </div>
  );
}
