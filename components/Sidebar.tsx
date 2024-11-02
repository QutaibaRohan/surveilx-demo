"use client";

import Link from "next/link";
import { Home, Video, FileEdit } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Videos",
    icon: Video,
    href: "/videos",
  },
  {
    label: "Library",
    icon: FileEdit,
    href: "/library",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 flex h-full w-64 flex-col bg-secondary">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold tracking-wider text-primary">
            SURVEILX
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => {
            const isActive = pathname === route.href;

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <route.icon className="h-4 w-4" />
                <span className="text-sm font-semibold">{route.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
