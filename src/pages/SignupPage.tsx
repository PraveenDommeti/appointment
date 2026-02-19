import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus, Eye, EyeOff, ArrowLeft, Shield, Sparkles,
  Check, Phone, Mail, User, Lock, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { signup, loginWithGoogle, isLoading, user } = useAuth();
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

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
      toast.success("Google Identity created. Welcome.");
      const storedUser = localStorage.getItem("classbook_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        handleRedirect(parsedUser.role);
      }
    } catch (error) {
      toast.error("Google Signup failed");
    }
  };

  const passwordMismatch = password && confirmPassword && password !== confirmPassword;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Simple password strength calculation
  const [strength, setStrength] = useState(0);
  useEffect(() => {
    let s = 0;
    if (password.length > 5) s++;
    if (password.length > 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) s++;
    setStrength(s);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMismatch) return;

    try {
      await signup(name, email, password, "student");
      toast.success("Identity established! Welcome to the matrix.");
      navigate("/student");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Integration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-6 relative overflow-hidden">
      {/* Motivational Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-teal-400/10 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Header Overlay */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-4 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm hover:translate-x-[-4px] transition-transform">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Initialize Your Journey</h1>
          <p className="text-foreground/50 font-medium italic">Establishing student node in the network.</p>
        </div>

        {/* Main Glass Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]">
          <Button
            onClick={handleGoogleSignup}
            variant="outline"
            disabled={isLoading}
            className="w-full h-14 rounded-2xl border-2 flex items-center justify-center gap-3 font-bold text-slate-600 mb-8 hover:bg-slate-50 transition-all active:scale-95"
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

          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <span className="relative bg-white/0 px-4 text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">OR MANUAL REGISTRATION</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Full Alias</Label>
                <div className="relative group">
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-14 rounded-2xl bg-white/50 border-slate-100 focus:border-primary/20 transition-all font-semibold italic pl-12"
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Contact Link</Label>
                <div className="relative group">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-14 rounded-2xl bg-white/50 border-slate-100 focus:border-primary/20 transition-all font-semibold italic pl-12"
                  />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Communication Channel</Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@nexus.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 rounded-2xl bg-white/50 border-slate-100 focus:border-primary/20 transition-all font-semibold italic pl-12"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Encryption Key</Label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 rounded-2xl bg-white/50 border-slate-100 focus:border-primary/20 transition-all font-semibold italic pl-12 pr-14"
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
              {/* Strength Indicator */}
              {password && (
                <div className="flex gap-1 mt-2 px-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= strength ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-100'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Confirm Encryption</Label>
              <div className="relative group">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`h-14 rounded-2xl bg-white/50 border-slate-100 focus:border-primary/20 transition-all font-semibold italic pl-12 ${passwordMismatch ? "ring-2 ring-rose-500/20" : ""}`}
                />
                <Check className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${passwordsMatch ? "text-emerald-500" : "text-foreground/20"}`} />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || passwordMismatch || !passwordsMatch}
              className="w-full h-15 bg-primary text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all group py-4 mt-4"
            >
              {isLoading ? "Integrating..." : "Establish Identity"}
              <Sparkles className="ml-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-8">
            <p className="text-sm font-semibold text-foreground/40 mb-2">Existing Identity Found?</p>
            <Link to="/login" className="text-sm font-extrabold text-primary hover:underline hover:opacity-80 transition-all uppercase tracking-tighter">
              Sign In to Portal
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
