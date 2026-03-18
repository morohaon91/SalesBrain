'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Edit, Loader2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch business profile from API
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.profile.get(),
    enabled: !!user,
  });

  const profile = response?.data as any;

  // Mutation for refreshing profile
  const refreshProfile = useMutation({
    mutationFn: () => api.profile.refresh(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Business Profile</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Your extracted business rules and communication style
          </p>
        </div>

        <div className="flex gap-2 flex-wrap flex-shrink-0">
          <Button variant="outline" className="flex items-center gap-2 text-sm whitespace-nowrap">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Re-extract</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
          <Button className="bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2 text-sm whitespace-nowrap">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Confidence Score */}
      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Profile Completion</h2>
            <span className="text-3xl font-bold text-primary-600">
              {profile?.completionScore || 0}%
            </span>
          </div>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-primary-600"
              style={{ width: `${profile?.completionScore || 0}%` }}
            />
          </div>

          <p className="text-sm text-gray-600">
            {profile && profile.completionScore > 0
              ? 'Your profile is being built from simulations. Run more simulations to improve accuracy.'
              : 'Complete simulations to build your profile.'}
          </p>
        </div>
      )}

      {/* Main Profile Content */}
      {!profile || profile.completionScore === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Yet Built</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Complete simulations to train your AI and build your business profile. The system will extract your:
          </p>
          <ul className="text-sm text-gray-600 mt-4 space-y-1">
            <li>• Pricing logic and negotiation style</li>
            <li>• Communication tone and preferences</li>
            <li>• Ideal client characteristics</li>
            <li>• Deal breakers and requirements</li>
          </ul>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pricing Rules */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                💰 Pricing Logic
              </h2>

              {profile?.pricingLogic ? (
                <div className="space-y-3">
                  {profile.pricingLogic.minBudget && (
                    <div>
                      <p className="text-xs font-medium text-gray-600">Minimum Budget</p>
                      <p className="text-lg font-bold text-primary-600 mt-1">
                        ${profile.pricingLogic.minBudget.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {profile.pricingLogic.maxBudget && (
                    <div>
                      <p className="text-xs font-medium text-gray-600">Maximum Budget</p>
                      <p className="text-lg font-bold text-primary-600">
                        ${profile.pricingLogic.maxBudget.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No pricing logic extracted yet</p>
              )}
            </div>

            {/* Communication Style */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                🎤 Communication Style
              </h2>

              {profile?.communicationStyle ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Tone</p>
                    <p className="text-sm font-semibold text-gray-900">{profile.communicationStyle.tone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Formality Level</p>
                    <p className="text-sm font-semibold text-gray-900">{profile.communicationStyle.formality}/5</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No communication style extracted yet</p>
              )}
            </div>
          </div>

          {/* Deal Breakers */}
          {profile?.pricingLogic?.dealBreakers && profile.pricingLogic.dealBreakers.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                🚫 Deal Breakers
              </h2>

              <div className="space-y-2">
                {profile.pricingLogic.dealBreakers.map((breaker, idx) => (
                  <div key={idx} className="p-3 bg-danger-50 border border-danger-200 rounded">
                    <p className="text-sm text-danger-900 font-medium">{breaker}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qualification Criteria */}
          {profile?.qualificationCriteria && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                ✅ Qualification Criteria
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Must Haves */}
                {profile.qualificationCriteria.mustHaves && profile.qualificationCriteria.mustHaves.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Must Haves</h3>
                    <ul className="space-y-2">
                      {profile.qualificationCriteria.mustHaves.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-success-600 font-bold">✓</span>
                          <span className="text-sm text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ideal Clients */}
                {profile.qualificationCriteria.idealClient && profile.qualificationCriteria.idealClient.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Ideal Clients</h3>
                    <ul className="space-y-2">
                      {profile.qualificationCriteria.idealClient.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary-600 font-bold">★</span>
                          <span className="text-sm text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Info Section */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold text-primary-900 mb-2">💡 How Profile Works</h3>
        <p className="text-sm text-primary-700 mb-4">
          Your business profile is automatically built from your simulations. Each conversation helps the system understand:
        </p>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>• Your pricing logic and budget constraints</li>
          <li>• Your communication style and tone</li>
          <li>• Deal-breakers and requirements</li>
          <li>• Ideal client characteristics</li>
        </ul>
        <p className="text-sm text-primary-700 mt-4">
          Complete more simulations to improve accuracy and build a comprehensive profile.
        </p>
      </div>
    </div>
  );
}
