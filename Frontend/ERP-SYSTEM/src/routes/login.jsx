import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Factory } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await login(form.email, form.password);
      // ── Role-based redirect ───────────────────────────────────────────────
      // VIEWERs (employees) go to their personal attendance page.
      // ADMIN and MANAGER go to the full ERP dashboard.
      if (res.role === "VIEWER") {
        navigate({ to: "/my-attendance" });
      } else {
        navigate({ to: "/" });
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Brand */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl
                          bg-primary text-primary-foreground">
            <Factory className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">ROTECH ERP</h1>
          <p className="text-sm text-muted-foreground">Manufacturing Suite v4.2</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sign in</CardTitle>
            <CardDescription>Enter your work email and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="you@rotech.co"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Admin:{" "}
          <span className="font-mono">admin@rotech.co</span>
          {" / "}
          <span className="font-mono">admin123</span>
        </p>
      </div>
    </div>
  );
}