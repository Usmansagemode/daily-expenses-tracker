"use client";

import { Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { SidebarTrigger } from "../ui/sidebar";

import { CommandPalette } from "./CommandPalette";
import { ModeToggle } from "./ThemeButton";

const Navbar = () => {
  return (
    <nav className="bg-background sticky top-0 z-10 flex items-center justify-between p-4">
      {/* LEFT */}
      <SidebarTrigger />

      <CommandPalette />

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Link href={"/"}>Dashboard</Link>
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground hidden gap-2 text-xs md:flex"
          onClick={() =>
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true }),
            )
          }
        >
          <Search className="h-3 w-3" />
          Search
          <kbd className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
            ⌘K
          </kbd>
        </Button>
        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
