import { cn } from "@/lib/utils";

export function Prose({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "field-notes-prose",
        className
      )}
    >
      {children}
    </div>
  );
}
