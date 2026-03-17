"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FolderKanban, UserRound, UsersRound } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
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
}: {
  pathname: string;
}) {
  return (
    <aside className="flex w-full flex-col">
      <div className="mb-8 hidden flex-col items-center gap-3 text-center sm:flex">
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
        <p className="max-w-[16ch] text-base text-muted-foreground">
          {"revolutionising humanity's systems"}
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
              className={cn(
                buttonVariants({ variant: active ? "default" : "ghost" }),
                "h-10 w-10 justify-center px-0 sm:w-full sm:justify-start sm:gap-2 sm:px-4",
              )}
              aria-label={item.label}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden text-base sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
      <div className="w-16 shrink-0 pr-3 sm:w-72 sm:pr-6">
        <SidebarNav pathname={pathname} />
      </div>

      <main className="flex-1 border-l pl-4 sm:pl-8">{children}</main>
    </div>
  );
}
