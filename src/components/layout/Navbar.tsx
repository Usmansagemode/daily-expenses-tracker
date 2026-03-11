"use client";

import { LogOut, Search, Settings, User } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
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

        <DropdownMenu>
          <DropdownMenuTrigger>
            {" "}
            <Avatar>
              <AvatarImage src="https://media.licdn.com/dms/image/v2/D4E03AQGJ-e_tzceJxQ/profile-displayphoto-shrink_400_400/B4EZR2EBOcG0Ak-/0/1737147553020?e=1762387200&v=beta&t=JjAlu_LFbsyd5e89kUj48qKg-V_bAAl-7aTpSLPS3qE" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-[1.2rem] w-[1.2rem]" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-[1.2rem] w-[1.2rem]" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <LogOut className="mr-2 h-[1.2rem] w-[1.2rem]" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
