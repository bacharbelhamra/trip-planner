import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ModeToggle } from "@/components/mode-toggle";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "../ui/button";

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false); // 🔥 control dialog

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="w-full h-16 border-b flex items-center justify-between px-6 bg-background">

      {/* LOGO */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src="/logo.svg" className="h-8" />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3">

        {/* CREATE TRIP */}
        {user && (
          <>
            <Button onClick={() => navigate("/create-trip")}>
              + Create Trip
            </Button>

            <Button variant="outline" onClick={() => navigate("/my-trips")}>
              My Trips
            </Button>
          </>
        )}

        {/* THEME */}
        <ModeToggle />

        {/* USER */}
        {user ? (
          <>
            {/* AVATAR */}
            <div
              onClick={() => setOpen(true)}
              className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold cursor-pointer hover:opacity-80 transition"
            >
              {user?.displayName?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() ||
                "U"}
            </div>

            {/* LOGOUT DIALOG */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Logout</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                  Are you sure you want to logout?
                </p>

                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>

                  <Button variant="destructive" onClick={handleLogout}>
                    Logout
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Account</Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/auth?mode=signin")}>
                Sign in
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate("/auth?mode=signup")}>
                Sign up
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

      </div>
    </div>
  );
}

export default Header;