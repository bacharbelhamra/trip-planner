import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
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

function SignupForm() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // ✅ Save display name
      await updateProfile(result.user, {
        displayName: name,
      });

      console.log("USER =", result.user);

      // ✅ Redirect
      navigate("/");

    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        alert("Email already exists. Please sign in.");
      } else if (error.code === "auth/weak-password") {
        alert("Password should be at least 6 characters.");
      } else {
        alert(error.message);
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      console.log("GOOGLE USER =", result.user);

      // ✅ Redirect
      navigate("/");

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-4">      
    <CardHeader>
      <CardTitle>Create an account</CardTitle>
      <CardDescription>
        Enter your information below to create your account
      </CardDescription>
    </CardHeader>

      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">

          <Input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full">
            Create Account
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
          >
            Sign up with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <span
              className="underline cursor-pointer"
              onClick={() => navigate("/auth?mode=signin")}
            >
              Sign in
            </span>
          </p>

        </form>
      </CardContent>
    </div>
  );
}

export default SignupForm;