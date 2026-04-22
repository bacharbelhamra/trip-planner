import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth } from "@/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function SigninForm() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignin = async (e) => {
    e.preventDefault();

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      console.log("USER =", result.user);

      // ✅ REDIRECT AFTER LOGIN
      navigate("/");

    } catch (error) {
      console.error(error);

      if (error.code === "auth/user-not-found") {
        alert("User not found. Please sign up.");
      } else if (error.code === "auth/wrong-password") {
        alert("Wrong password.");
      } else if (error.code === "auth/invalid-credential") {
        alert("Invalid email or password.");
      } else {
        alert(error.message);
      }
    }
  };

  const handleGoogleSignin = async () => {
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      console.log("GOOGLE USER =", result.user);

      // ✅ REDIRECT
      navigate("/");

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

return (
  <div className="w-full max-w-sm mx-auto space-y-6">

    {/* HEADER */}
    <div className="space-y-1 text-left">
      <h2 className="text-xl font-semibold">Welcome Back</h2>
      <p className="text-sm text-muted-foreground">
        Sign in to your account
      </p>
    </div>

    {/* FORM */}
    <form onSubmit={handleSignin} className="space-y-4">

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button type="submit" className="w-full">
        Sign in
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignin}
      >
        Continue with Google
      </Button>

    </form>

    {/* SWITCH */}
    <p className="text-sm text-center text-muted-foreground">
      Don’t have an account?{" "}
      <span
        className="underline cursor-pointer"
        onClick={() => navigate("/auth?mode=signup")}
      >
        Sign up
      </span>
    </p>

  </div>
);
}

export default SigninForm;