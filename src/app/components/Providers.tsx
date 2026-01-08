'use client';

import { HeroUIProvider } from '@heroui/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <main className="dark text-foreground bg-background">
        <HeroUIProvider>{children}</HeroUIProvider>
    </main>
)}
