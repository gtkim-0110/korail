import {MenuContextProvider} from '@/contexts/menuContext';

export async function MenuProvider({ children }: { children: React.ReactNode }) {
  const res = await fetch(`${process.env.API_BASE_URL}/menus`, { cache: 'no-store' });
  const menus = await res.json();

  return (
    <MenuContextProvider menus={menus}>
      {children}
    </MenuContextProvider>
  );
}