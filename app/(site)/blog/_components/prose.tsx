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
        "max-w-none space-y-6 text-base leading-7 text-foreground",
        "[&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
        "[&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm",
        "[&_h1]:mt-10 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:tracking-tight",
        "[&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight",
        "[&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight",
        "[&_hr]:border-border",
        "[&_img]:rounded-xl [&_img]:border [&_img]:border-border",
        "[&_li]:leading-7",
        "[&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-2",
        "[&_p]:leading-7",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-secondary [&_pre]:p-4",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-xl",
        "[&_tbody_tr]:border-t [&_tbody_tr]:border-border",
        "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top",
        "[&_th]:border [&_th]:border-border [&_th]:bg-secondary [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold",
        "[&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2",
        className
      )}
    >
      {children}
    </div>
  );
}
