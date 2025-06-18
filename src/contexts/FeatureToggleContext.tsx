
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface FeatureToggleContextType {
  isSubmissionEnabled: boolean;
  setIsSubmissionEnabled: (enabled: boolean) => void;
  toggleSubmission: () => void;
}

const FeatureToggleContext = createContext<FeatureToggleContextType | undefined>(undefined);

export const FeatureToggleProvider = ({ children }: { children: ReactNode }) => {
  const [isSubmissionEnabled, setIsSubmissionEnabledState] = useState<boolean>(() => {
    // Initialize from localStorage only on the client side
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('isSubmissionEnabled');
      return storedValue !== null ? JSON.parse(storedValue) : true; // Default to true (enabled)
    }
    return true; // Default for SSR or before hydration
  });

  useEffect(() => {
    // Effect to handle initial setting if localStorage wasn't available server-side
    // or to sync if it somehow got out of sync (though less likely with direct useState init)
    if (typeof window !== 'undefined') {
        const storedValue = localStorage.getItem('isSubmissionEnabled');
        const initialValue = storedValue !== null ? JSON.parse(storedValue) : true;
        if (isSubmissionEnabled !== initialValue) { // Check if state needs sync
            setIsSubmissionEnabledState(initialValue);
        }
    }
  }, []); // Runs once on mount client-side


  const setIsSubmissionEnabled = useCallback((enabled: boolean) => {
    setIsSubmissionEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isSubmissionEnabled', JSON.stringify(enabled));
    }
  }, []);

  const toggleSubmission = useCallback(() => {
    setIsSubmissionEnabled(!isSubmissionEnabled);
  }, [isSubmissionEnabled, setIsSubmissionEnabled]);

  return (
    <FeatureToggleContext.Provider value={{ isSubmissionEnabled, setIsSubmissionEnabled, toggleSubmission }}>
      {children}
    </FeatureToggleContext.Provider>
  );
};

export const useFeatureToggle = (): FeatureToggleContextType => {
  const context = useContext(FeatureToggleContext);
  if (context === undefined) {
    throw new Error('useFeatureToggle must be used within a FeatureToggleProvider');
  }
  return context;
};
