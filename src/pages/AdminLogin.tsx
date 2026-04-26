import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { login } from "@/lib/api";
import logo from "@/assets/logo.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing fields", description: "Enter your email and password." });
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      toast({ title: "Welcome back ✨", description: "Signed in successfully." });
      navigate("/admin");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid email or password.";
      toast({ title: "Login failed", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-glow"
      >
        <Link to="/" className="mb-6 flex flex-col items-center justify-center gap-3">
          <img
            src={logo}
            alt="Derm Whitening"
            className="h-20 w-20 object-contain drop-shadow-[0_8px_20px_hsl(var(--primary)/0.45)]"
          />
          <span className="font-display text-xl font-bold">Derm Whitening Admin</span>
        </Link>

        <h1 className="text-center font-display text-3xl font-bold">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Sign in to your dashboard</p>

        <form onSubmit={submit} className="mt-8 space-y-4" noValidate autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@glow.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl pl-11"
                autoComplete="email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl pl-11 pr-11"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted transition text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="pt-3 text-center text-xs text-muted-foreground">
            Back to{" "}
            <Link to="/" className="font-semibold text-primary hover:underline">
              homepage
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;