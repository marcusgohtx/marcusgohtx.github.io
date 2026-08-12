"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "About me", href: "/about-me" },
  { label: "Socials", href: "/socials" },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) {
    return false;
  }

  if (href === "/projects") {
    return pathname === "/" || pathname.startsWith("/projects");
  }

  return pathname.startsWith(href);
}

function SiteNavigation({ pathname }: { pathname: string | null }) {
  return (
    <header className="field-notes-header">
      <div className="field-notes-portrait">
        <span className="field-notes-portrait-frame">
          <Image
            src="/profile.jpg"
            alt="Marcus Goh"
            fill
            sizes="48px"
            className="object-cover object-top"
            priority
          />
        </span>
      </div>

      <nav className="field-notes-nav">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="field-notes-nav-link"
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="field-notes-site">
      <div className="field-notes-frame">
        <SiteNavigation pathname={pathname} />
        <main className="field-notes-main">{children}</main>
      </div>
    </div>
  );
}
