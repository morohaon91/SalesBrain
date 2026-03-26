'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api/auth-fetch';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import CommunicationStyleForm from '@/components/profile/CommunicationStyleForm';
import PricingLogicForm from '@/components/profile/PricingLogicForm';
import QualificationForm from '@/components/profile/QualificationForm';
import ObjectionHandlingForm from '@/components/profile/ObjectionHandlingForm';
import DecisionMakingForm from '@/components/profile/DecisionMakingForm';

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [communicationStyle, setCommunicationStyle] = useState<Record<string, any>>({});
  const [pricingLogic, setPricingLogic] = useState<Record<string, any>>({});
  const [qualificationCriteria, setQualificationCriteria] = useState<Record<string, any>>({});
  const [objectionHandling, setObjectionHandling] = useState<Record<string, any>>({});
  const [decisionMakingPatterns, setDecisionMakingPatterns] = useState<Record<string, any>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await authFetch('/api/v1/profile');
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      const p = data.data ?? data;
      setCommunicationStyle(p.communicationStyle ?? {});
      setPricingLogic(p.pricingLogic ?? {});
      setQualificationCriteria(p.qualificationCriteria ?? {});
      setObjectionHandling(p.objectionHandling ?? {});
      setDecisionMakingPatterns(p.decisionMakingPatterns ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await authFetch('/api/v1/profile', {
        method: 'PUT',
        body: JSON.stringify({
          communicationStyle,
          pricingLogic,
          qualificationCriteria,
          objectionHandling,
          decisionMakingPatterns,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error?.message || 'Save failed');
      }
      setSuccessMsg('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile Patterns</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{successMsg}</div>}

      <Card className="p-6">
        <Tabs defaultValue="communication">
          <TabsList className="mb-6 grid grid-cols-5 w-full">
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="qualification">Qualification</TabsTrigger>
            <TabsTrigger value="objections">Objections</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
          </TabsList>

          <TabsContent value="communication">
            <CommunicationStyleForm value={communicationStyle} onChange={setCommunicationStyle} />
          </TabsContent>
          <TabsContent value="pricing">
            <PricingLogicForm value={pricingLogic} onChange={setPricingLogic} />
          </TabsContent>
          <TabsContent value="qualification">
            <QualificationForm value={qualificationCriteria} onChange={setQualificationCriteria} />
          </TabsContent>
          <TabsContent value="objections">
            <ObjectionHandlingForm value={objectionHandling} onChange={setObjectionHandling} />
          </TabsContent>
          <TabsContent value="decisions">
            <DecisionMakingForm value={decisionMakingPatterns} onChange={setDecisionMakingPatterns} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
