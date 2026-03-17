"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FolderKanban, Menu, UserRound, UsersRound } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "About me", href: "/about-me", icon: UserRound },
  { label: "Socials", href: "/socials", icon: UsersRound },
];

function isActive(pathname: string, href: string) {
  if (href === "/projects") {
    return pathname === "/" || pathname.startsWith("/projects");
  }

  return pathname.startsWith(href);
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <aside className="flex w-full flex-col">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="relative h-28 w-28 overflow-hidden rounded-full border">
          <Image
            src="/profile.jpg"
            alt="Marcus Goh"
            fill
            sizes="112px"
            className="object-cover"
            priority
          />
        </div>
        <p className="max-w-[16ch] text-sm text-muted-foreground">
          Builder crafting practical, human-centered digital tools.
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                buttonVariants({ variant: active ? "default" : "ghost" }),
                "w-full justify-start gap-2",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="hidden w-72 shrink-0 md:block md:pr-6">
        <SidebarNav pathname={pathname} />
      </div>

      <main className="flex-1 md:border-l md:pl-8">{children}</main>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            size="icon"
            className="fixed bottom-5 right-5 z-40 rounded-full shadow-lg md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <div className="mt-10">
            <SidebarNav pathname={pathname} onNavigate={() => setIsSheetOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
