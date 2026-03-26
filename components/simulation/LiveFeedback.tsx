'use client';

import { Sparkles } from 'lucide-react';

interface LiveFeedbackProps {
  message: string;
}

export default function LiveFeedback({ message }: LiveFeedbackProps) {
  return (
    <div className="flex justify-center my-2">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm text-green-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Sparkles className="h-4 w-4 text-green-600 flex-shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
