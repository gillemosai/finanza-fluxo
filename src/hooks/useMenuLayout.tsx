import { createContext, useContext, useState, ReactNode } from 'react';

type MenuLayout = 'sidebar' | 'top';

interface MenuLayoutContextType {
  layout: MenuLayout;
  setLayout: (layout: MenuLayout) => void;
}

const MenuLayoutContext = createContext<MenuLayoutContextType | undefined>(undefined);

export function MenuLayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<MenuLayout>('sidebar');

  return (
    <MenuLayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </MenuLayoutContext.Provider>
  );
}

export function useMenuLayout() {
  const context = useContext(MenuLayoutContext);
  if (context === undefined) {
    throw new Error('useMenuLayout must be used within a MenuLayoutProvider');
  }
  return context;
}