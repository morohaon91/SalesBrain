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
    <div
      className={`flex border-b ${className}`}
      style={{ borderColor: 'hsl(var(--border))' }}
    >
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
      className="px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-150"
      style={{
        borderBottomColor: isActive ? 'hsl(var(--primary))' : 'transparent',
        color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
        marginBottom: '-1px',
      }}
      onMouseEnter={e => {
        if (!isActive) (e.currentTarget as HTMLElement).style.color = 'hsl(var(--foreground))';
      }}
      onMouseLeave={e => {
        if (!isActive) (e.currentTarget as HTMLElement).style.color = 'hsl(var(--muted-foreground))';
      }}
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
