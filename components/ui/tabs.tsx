'use client';

import { createContext, useContext, useState } from 'react';

interface TabsContextType {
  active: string;
  setActive: (val: string) => void;
}

const TabsContext = createContext<TabsContextType>({ active: '', setActive: () => {} });

export function Tabs({
  defaultValue,
  children,
  className = '',
}: {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === value;
  return (
    <button
      type="button"
      onClick={() => setActive(value)}
      className={[
        'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div className="pt-4">{children}</div>;
}
