"use client";

import { type ComponentType, useState } from "react";
import { FolderKanban, Menu, UserRound, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type TabId = "projects" | "about" | "socials";

type TabItem = {
  id: TabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const tabs: TabItem[] = [
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "about", label: "About me", icon: UserRound },
  { id: "socials", label: "Socials", icon: UsersRound },
];

function SidebarNav({
  activeTab,
  onSelect,
  compact,
}: {
  activeTab: TabId;
  onSelect: (tab: TabId) => void;
  compact?: boolean;
}) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-card/85 p-5 backdrop-blur",
        compact ? "w-full" : "w-72",
      )}
    >
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-secondary text-sm font-semibold text-muted-foreground shadow-sm">
          PHOTO
        </div>
        <p className="max-w-[16ch] text-sm font-medium text-muted-foreground">
          Curious builder crafting useful digital experiences.
        </p>
      </div>

      <nav className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Button
              key={tab.id}
              type="button"
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => onSelect(tab.id)}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}

function ContentPanel({ activeTab }: { activeTab: TabId }) {
  if (activeTab === "projects") {
    return (
      <section className="space-y-5">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          A selection of work and experiments will appear here.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>Description</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    );
  }

  if (activeTab === "about") {
    return (
      <section className="space-y-5">
        <h1 className="text-3xl font-bold tracking-tight">About me</h1>
        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
            <CardDescription>
              Add your personal background, strengths, and interests here.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <h1 className="text-3xl font-bold tracking-tight">Socials</h1>
      <Card>
        <CardHeader>
          <CardTitle>Find me online</CardTitle>
          <CardDescription>Add your social links and preferred contact channels.</CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("projects");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const selectTab = (tab: TabId) => {
    setActiveTab(tab);
    setIsSheetOpen(false);
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl gap-6">
        <div className="sticky top-6 hidden h-[calc(100vh-3rem)] md:block">
          <SidebarNav activeTab={activeTab} onSelect={selectTab} />
        </div>

        <main className="min-h-[calc(100vh-3rem)] flex-1 rounded-2xl border bg-card/85 p-6 shadow-sm backdrop-blur sm:p-8">
          <ContentPanel activeTab={activeTab} />
        </main>
      </div>

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
          <div className="mt-10 h-full">
            <SidebarNav activeTab={activeTab} onSelect={selectTab} compact />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
