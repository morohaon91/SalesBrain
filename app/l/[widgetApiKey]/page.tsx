'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';

type ChatLine = { role: 'ai' | 'lead'; content: string };

export default function PublicLeadChatPage() {
  const params = useParams();
  const widgetApiKey = params.widgetApiKey as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [ended, setEnded] = useState(false);
  const [ending, setEnding] = useState(false);

  const base = '/api/v1/public/lead-chat';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${base}/${encodeURIComponent(widgetApiKey)}/start`, {
          method: 'POST',
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data?.error?.message || 'Could not start chat');
          return;
        }
        const d = data.data;
        setConversationId(d.conversationId);
        setBusinessName(d.businessName || 'Business');
        setGreeting(d.greeting || '');
        setMessages([{ role: 'ai', content: d.greeting || 'Hi!' }]);
      } catch {
        if (!cancelled) setError('Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [widgetApiKey]);

  const endChat = useCallback(async () => {
    if (!conversationId || ended || ending) return;
    setEnding(true);
    setError(null);
    try {
      const res = await fetch(`${base}/${encodeURIComponent(widgetApiKey)}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || 'Could not end chat');
        return;
      }
      setEnded(true);
    } catch {
      setError('Network error');
    } finally {
      setEnding(false);
    }
  }, [base, conversationId, ended, ending, widgetApiKey]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || !conversationId || sending || ended) return;
    setSending(true);
    setInput('');
    setMessages((m) => [...m, { role: 'lead', content: text }]);
    setError(null);
    try {
      const res = await fetch(`${base}/${encodeURIComponent(widgetApiKey)}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || 'Send failed');
        return;
      }
      const reply = data.data?.reply as string;
      if (reply) {
        setMessages((m) => [...m, { role: 'ai', content: reply }]);
      }
    } catch {
      setError('Network error');
    } finally {
      setSending(false);
    }
  }, [conversationId, ended, input, sending, widgetApiKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error && !conversationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-medium">{error}</p>
          <p className="mt-2 text-sm text-red-700">
            If you are the owner: approve your profile (go live) under Profile, then try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="border-b bg-white px-4 py-3 shadow-sm flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{businessName}</h1>
          <p className="text-xs text-slate-500">
            Replies use this business&apos;s approved profile and questionnaire — not a generic chatbot.
          </p>
        </div>
        {conversationId && !ended && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={ending}
            onClick={() => void endChat()}
          >
            {ending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            End chat
          </Button>
        )}
      </header>

      {ended && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-900">
          This chat has ended. The business can see this thread on their Conversations page.
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-2xl mx-auto w-full">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'lead' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                m.role === 'lead'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white border px-4 py-2 text-slate-500 text-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      {error && conversationId && (
        <div className="px-4 pb-2 text-sm text-red-600 text-center">{error}</div>
      )}

      <div className="border-t bg-white p-4 max-w-2xl mx-auto w-full">
        {ended ? (
          <p className="text-sm text-slate-500 text-center">You can close this tab.</p>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              rows={2}
              className="flex-1 resize-none"
              disabled={sending || !conversationId || ended}
            />
            <Button type="submit" disabled={sending || !input.trim() || !conversationId || ended}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
