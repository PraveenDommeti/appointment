import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Eye, EyeOff, Lock, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, loginWithGoogle, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      handleRedirect(user.role);
    }
  }, [user]);

  const handleRedirect = (role: string) => {
    if (role === "superadmin") navigate("/superadmin");
    else if (role === "admin") navigate("/admin");
    else if (role === "trainer") navigate("/trainer");
    else navigate("/student");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email.trim(), password.trim());
      toast.success("Identity verified. Access granted.");

      const storedUser = localStorage.getItem("classbook_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        handleRedirect(parsedUser.role);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Validation failed");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success("Google Authentication successful.");
      // Redirect after successful Google auth
      const storedUser = localStorage.getItem("classbook_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        handleRedirect(parsedUser.role);
      }
    } catch (error) {
      toast.error("Google Auth failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Left Side: Illustration & Brand */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-teal-500 relative items-center justify-center p-20 text-white overflow-hidden">
        {/* Decorative Elements */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[100px]"
        />
        <div className="absolute top-0 right-0 w-full h-full bg-white/5 backdrop-blur-[10px] -rotate-12 translate-x-1/2 translate-y-1/2 rounded-full" />

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="h-20 w-20 rounded-[2rem] bg-white flex items-center justify-center shadow-2xl mb-12 group hover:rotate-12 transition-transform">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-6xl font-black tracking-tighter mb-8 leading-[0.9] italic uppercase">
              Elevate Your <br />
              <span className="text-white/60 not-italic">Learning</span> <br />
              Journey.
            </h2>
            <ul className="space-y-6">
              {[
                "Real-time class coordination",
                "Automated attendance tracking",
                "Instant trainer communication",
                "Centralized educational assets"
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="flex items-center gap-4 text-lg font-bold italic tracking-tight"
                >
                  <div className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_10px_#2dd4bf]" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-10 text-white/20 font-black tracking-[0.3em] text-[10px] uppercase italic">
          CLASSE FRANÇAISE SYSTEM v4.2.0
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        {/* Background Shapes */}
        <div className="absolute top-[-5%] right-[-5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-5%] w-72 h-72 bg-teal-400/5 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:opacity-70 transition-opacity">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <h1 className="text-4xl font-extrabold text-foreground mb-3">Welcome Back</h1>
            <p className="text-foreground/50 font-medium">Please sign in to access your dashboard.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl border-2 flex items-center justify-center gap-3 font-bold text-slate-600 mb-6 hover:bg-slate-50 transition-all active:scale-95"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" opacity=".1" />
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <span className="relative bg-white px-4 text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">OR IDENTITY ACCESS</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Entity Identifier</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@syndicate.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all font-semibold italic pl-12"
                  />
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-foreground/40">Access Key</Label>
                  <button type="button" className="text-xs font-bold text-primary hover:opacity-70 transition-opacity italic">Forgot Key?</button>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all font-semibold italic pl-12 pr-14"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 px-1">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="rounded-md border-slate-200"
                />
                <label htmlFor="remember" className="text-sm font-semibold text-foreground/60 cursor-pointer">Remember this device</label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-15 bg-primary text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all group py-4"
              >
                {isLoading ? "Synchronizing..." : "Sign In"}
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm font-semibold text-foreground/40 mb-2">Unregistered Account?</p>
              <Link to="/signup" className="text-sm font-extrabold text-primary hover:underline hover:opacity-80 transition-all uppercase tracking-tighter">
                Create Student Identity
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
