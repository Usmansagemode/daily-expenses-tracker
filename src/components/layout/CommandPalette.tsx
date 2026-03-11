"use client";

import { useEffect, useState } from "react";
import {
  BarChart2,
  CreditCard,
  LayoutDashboard,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const NAV_ITEMS = [
  { href: "/expenses", icon: LayoutDashboard, label: "Expenses" },
  { href: "/yearly-charts", icon: BarChart2, label: "Yearly Charts" },
  { href: "/import-expenses", icon: Upload, label: "Import Expenses" },
  { href: "/trackers", icon: CreditCard, label: "Trackers" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Go to..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <CommandItem key={href} onSelect={() => handleSelect(href)}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
