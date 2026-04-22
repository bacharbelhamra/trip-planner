import { useSearchParams } from "react-router-dom";
import SigninForm from "@/components/SigninForm";
import SignupForm from "@/components/SignupForm";

function Auth() {
  const [searchParams] = useSearchParams();

  const mode = searchParams.get("mode") || "signin";
  const isSignup = mode === "signup";

  return (
    
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      

      <div className="flex w-full max-w-5xl min-h-[650px] border rounded-xl shadow-lg overflow-hidden bg-background">

        {/* LEFT - FORM */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">

          <div className="w-full max-w-md space-y-6">
            {/* FORM */}
            {isSignup ? <SignupForm /> : <SigninForm />}

          </div>

        </div>
        {/* RIGHT - IMAGE */}
        <div className="hidden lg:flex w-1/2 relative">

          <img
            src="/travelpic.jpg"
            alt="travel"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* text */}
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-white text-center p-8">
            <h2 className="text-3xl font-bold">
            Plan smarter trips
          </h2>
            <p className="text-sm opacity-80 mt-3 max-w-xs">
              Generate AI-powered itineraries and explore the world easily.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Auth;