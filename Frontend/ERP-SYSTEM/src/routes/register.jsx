import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Factory } from "lucide-react";
import { authApi, token } from "@/lib/api"; 
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// TanStack Router needs this named export
export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { login } = useAuth(); 
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "ADMIN" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Call backend register API payload
      const res = await authApi.register(form);
      
      // Save tokens and context state
      token.set(res.token);
      token.setUser({ email: res.email, fullName: res.fullName, role: res.role });
      
      // Fixed navigation to "/" to align with indexRoute path in router.js
      navigate({ to: "/" });
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Factory className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">ROTECH ERP</h1>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Register</CardTitle>
            <CardDescription>Sign up for an administrator or team account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  type="text"
                  placeholder="Aron Ngetich"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="you@rotech.co"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
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
                {loading ? "Creating Account…" : "Register Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RegisterPage;