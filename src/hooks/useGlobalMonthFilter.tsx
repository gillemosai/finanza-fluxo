import { createContext, useContext, useState, ReactNode } from "react";

interface GlobalMonthFilterContextType {
  selectedMonth: string | null;
  setSelectedMonth: (month: string | null) => void;
}

const GlobalMonthFilterContext = createContext<GlobalMonthFilterContextType | undefined>(undefined);

export function GlobalMonthFilterProvider({ children }: { children: ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(() => {
    // Set current month as default using exact same format as MonthFilter
    const now = new Date();
    const monthName = now.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    const year = now.getFullYear().toString().slice(-2);
    return `${monthName}/${year}`;
  });

  return (
    <GlobalMonthFilterContext.Provider value={{ selectedMonth, setSelectedMonth }}>
      {children}
    </GlobalMonthFilterContext.Provider>
  );
}

export function useGlobalMonthFilter() {
  const context = useContext(GlobalMonthFilterContext);
  if (context === undefined) {
    throw new Error('useGlobalMonthFilter must be used within a GlobalMonthFilterProvider');
  }
  return context;
}