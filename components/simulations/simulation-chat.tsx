'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/lib/hooks/useI18n';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageBubble } from '@/components/shared/message-bubble';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimulationChatProps {
  simulationId: string;
}

interface SimulationData {
  id: string;
  scenarioType: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  aiPersona: {
    clientType: string;
    personality: string;
    budget?: string;
    painPoints?: string[];
  };
  duration: number;
  messageCount: number;
  messages: Array<{
    id: string;
    role: 'AI_CLIENT' | 'BUSINESS_OWNER';
    content: string;
    createdAt: string;
  }>;
}

export function SimulationChat({ simulationId }: SimulationChatProps) {
  const { t } = useI18n(['simulations']);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch simulation data
  const { data: simulationResponse, isLoading: isSimulationLoading, error } = useQuery({
    queryKey: ['simulations', simulationId],
    queryFn: () => api.simulations.get(simulationId),
    refetchInterval: 2000, // Poll every 2 seconds for new messages
    refetchIntervalInBackground: false,
  });

  const simulation = simulationResponse?.data as SimulationData | undefined;

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      api.simulations.sendMessage(simulationId, { content }),
    onSuccess: () => {
      setMessage('');
      // Invalidate query to refetch
      queryClient.invalidateQueries({ queryKey: ['simulations', simulationId] });
      scrollToBottom();
    },
    onError: (error: any) => {
      console.error('Failed to send message:', error);
    },
  });

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [simulation?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessage.isPending) {
      sendMessage.mutate(message);
    }
  };

  if (isSimulationLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white border border-gray-200 rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-600">{t('simulations:chat.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="flex items-center justify-center h-96 bg-white border border-gray-200 rounded-lg">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="w-8 h-8 text-danger-600" />
          <p className="text-gray-900 font-medium">{t('simulations:chat.loadErrorTitle')}</p>
          <p className="text-sm text-gray-600">
            {error instanceof Error ? error.message : t('simulations:chat.tryAgain')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header with Scenario Info */}
      <div className="bg-primary-50 border-b border-primary-200 p-4">
        <h3 className="font-semibold text-primary-900">
          {t('simulations:chat.scenarioLabel', {
            type: simulation.scenarioType.replace(/_/g, ' '),
          })}
        </h3>
        <p className="text-sm text-primary-700 mt-1">
          {simulation.aiPersona.clientType}
          {simulation.aiPersona.personality && ` • ${simulation.aiPersona.personality}`}
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {simulation.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-500">{t('simulations:chat.noMessages')}</p>
          </div>
        ) : (
          <>
            {simulation.messages.map((msg) => (
              <div key={msg.id}>
                <MessageBubble
                  role={msg.role === 'BUSINESS_OWNER' ? 'user' : 'assistant'}
                  content={msg.content}
                  timestamp={msg.createdAt}
                />
              </div>
            ))}
          </>
        )}

        {/* Loading indicator */}
        {sendMessage.isPending && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{t('simulations:chat.thinking')}</span>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {simulation.status === 'IN_PROGRESS' ? (
        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-200 p-4 space-y-3"
        >
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('simulations:chat.inputPlaceholder')}
            rows={3}
            disabled={sendMessage.isPending}
            className="resize-none"
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="submit"
              disabled={!message.trim() || sendMessage.isPending}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {sendMessage.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('simulations:chat.sending')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('simulations:chat.send')}
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">{t('simulations:chat.completedHint')}</p>
        </div>
      )}
    </div>
  );
}
