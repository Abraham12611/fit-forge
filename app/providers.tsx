"use client";

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { HeroUIProvider } from '@heroui/system';
import { useRouter } from 'next/navigation';

export function Providers({ children, themeProps = { attribute: "class", defaultTheme: "dark" } }) {
  const router = useRouter();

  console.log("Providers component rendering");

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
