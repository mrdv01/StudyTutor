"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const supabase = createClient();

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    fetchUser();

    //  Listen for login/logout changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );

    return () => subscription?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-60">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        {/* 🎓 Logo */}
        <Link href="/" className="text-2xl font-bold text-primary">
          🎓PrepzenX
        </Link>

        {/* 🖥️ Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <NavigationMenu>
            <NavigationMenuList>
              {["Home", "About"].map((label) => (
                <NavigationMenuItem key={label}>
                  <Link
                    href={`/${label === "Home" ? "" : label.toLowerCase()}`}
                    legacyBehavior
                    passHref
                  >
                    <NavigationMenuLink className="px-3 py-2 text-sm font-medium hover:text-primary transition">
                      {label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {user ? (
            <Button onClick={handleLogout}>Logout</Button>
          ) : (
            <Button asChild>
              <Link href="/sign-in">Login</Link>
            </Button>
          )}
        </div>

        {/* 📱 Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px]">
              <SheetTitle className="sr-only">Main Menu</SheetTitle>

              <div className="flex flex-col gap-4 mt-8">
                {["Home", "About"].map((label) => (
                  <Link
                    key={label}
                    href={`/${label === "Home" ? "" : label.toLowerCase()}`}
                    className="text-lg"
                    passHref
                  >
                    {label}
                  </Link>
                ))}

                {user ? (
                  <Button onClick={handleLogout}>Logout</Button>
                ) : (
                  <Button asChild>
                    <Link href="/sign-in">Login</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
