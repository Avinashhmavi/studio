'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type JurisdictionContextType = {
  jurisdiction: string;
  setJurisdiction: (jurisdiction: string) => void;
};

const JurisdictionContext = createContext<JurisdictionContextType | undefined>(undefined);

export function JurisdictionProvider({ children }: { children: ReactNode }) {
  const [jurisdiction, setJurisdiction] = useState('California');

  return (
    <JurisdictionContext.Provider value={{ jurisdiction, setJurisdiction }}>
      {children}
    </JurisdictionContext.Provider>
  );
}

export function useJurisdiction() {
  const context = useContext(JurisdictionContext);
  if (context === undefined) {
    throw new Error('useJurisdiction must be used within a JurisdictionProvider');
  }
  return context;
}
