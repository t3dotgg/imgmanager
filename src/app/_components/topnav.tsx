import {
  OrganizationSwitcher,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import React from "react";

const TopNavLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative grid h-screen max-h-screen grid-cols-1 grid-rows-[auto,_1fr] flex-col">
      <header className="z-10 flex-shrink shadow-xl">
        <nav className="container mx-auto flex justify-between px-4 py-4">
          <span className="text-2xl font-bold">imgthing</span>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            {/* TODO: Hide org switcher if not in an org */}
            <OrganizationSwitcher appearance={{ baseTheme: dark }} />
            <UserButton />
          </SignedIn>
        </nav>
      </header>
      <main className="min-h-0 flex-grow overflow-y-scroll">{children}</main>
    </div>
  );
};

export default TopNavLayout;
