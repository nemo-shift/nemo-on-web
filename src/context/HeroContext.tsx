'use client';

import React, { createContext, useContext, useState } from 'react';

type HeroContextType = {
  isOn: boolean;
  toggle: () => void;
  isScrollable: boolean;
};

const HeroContext = createContext<HeroContextType>({
  isOn: false,
  toggle: () => {},
  isScrollable: false,
});

export function HeroProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [isOn, setIsOn] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  const toggle = () => {
    setIsOn((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => setIsScrollable(true), 2400);
      } else {
        setIsScrollable(false);
      }
      return next;
    });
  };

  return (
    <HeroContext.Provider value={{ isOn, toggle, isScrollable }}>
      {children}
    </HeroContext.Provider>
  );
}

export function useHeroContext(): HeroContextType {
  const ctx = useContext(HeroContext);
  if (!ctx) {
    throw new Error('useHeroContext must be used within HeroProvider');
  }
  return ctx;
}
