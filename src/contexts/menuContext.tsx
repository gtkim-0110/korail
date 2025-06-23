'use client';

import { createContext, useContext } from 'react';

export const MenuContext = createContext<any[]>([]);

export function useMenu() {
  return useContext(MenuContext);
}

export function MenuContextProvider({ menus, children }: { menus: any[], children: React.ReactNode }) {
  return (
    <MenuContext.Provider value={menus}>
      {children}
    </MenuContext.Provider>
  );
}