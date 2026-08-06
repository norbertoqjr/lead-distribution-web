'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Route } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './sidebar-nav';

/**
 * Mobile sidebar. The design puts navigation in a Sheet below 768px rather
 * than collapsing it to icons, so labels stay readable.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 rounded-r-3xl px-5 py-6">
        <SheetHeader className="p-0">
          <SheetTitle asChild>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="mb-8 flex items-center gap-3 text-xl font-semibold"
            >
              <span className="bg-accent text-accent-foreground grid size-8 place-items-center rounded-xl">
                <Route className="size-4.5" aria-hidden="true" />
              </span>
              Lead Distribution
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Closing on navigate: leaving the sheet open over the new page reads
            as the tap not registering. */}
        <SidebarNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
