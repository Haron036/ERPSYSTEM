import { useState } from "react";
import { Moon, Sun, KeyRound, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

// ── Theme toggle ──────────────────────────────────────────────────────────────

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("erp_theme", next);
    setTheme(next);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {theme === "dark"
            ? <Moon className="h-4 w-4 text-muted-foreground" />
            : <Sun  className="h-4 w-4 text-muted-foreground" />}
          Appearance
        </CardTitle>
        <CardDescription>Choose how ROTECH ERP looks for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <div>
            <p className="text-sm font-medium">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {theme === "dark"
                ? "Easy on the eyes in low-light environments."
                : "Clear and bright for daytime use."}
            </p>
          </div>

          {/* Toggle pill */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center
                        rounded-full border-2 border-transparent transition-colors
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                        ${theme === "dark" ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full
                          bg-white shadow-lg ring-0 transition-transform
                          ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`}
            >
              {/* Mini icon inside the knob */}
              <span className="flex h-full w-full items-center justify-center">
                {theme === "dark"
                  ? <Moon className="h-2.5 w-2.5 text-primary" />
                  : <Sun  className="h-2.5 w-2.5 text-amber-500" />}
              </span>
            </span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Password field with show/hide ─────────────────────────────────────────────

function PasswordInput({ id, value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="pr-9"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2
                   text-muted-foreground hover:text-foreground transition-colors"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

// ── Password strength indicator ───────────────────────────────────────────────

function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8          },
    { label: "Uppercase letter",       pass: /[A-Z]/.test(password)        },
    { label: "Number",                 pass: /[0-9]/.test(password)        },
    { label: "Special character",      pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-red-400", "bg-orange-400", "bg-amber-400", "bg-emerald-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="space-y-2 mt-1">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors
                        ${i < score ? colors[score - 1] : "bg-muted"}`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-medium ${score > 0 ? colors[score - 1].replace("bg-", "text-") : ""}`}>
        {score > 0 ? labels[score - 1] : ""}
      </p>
      {/* Checklist */}
      <ul className="space-y-0.5">
        {checks.map(({ label, pass }) => (
          <li key={label} className={`flex items-center gap-1.5 text-[11px]
                                      ${pass ? "text-emerald-600" : "text-muted-foreground"}`}>
            <CheckCircle2 className={`h-3 w-3 shrink-0 ${pass ? "text-emerald-500" : "text-muted-foreground/40"}`} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Change password form ──────────────────────────────────────────────────────

const EMPTY_FORM = { current: "", next: "", confirm: "" };

function ChangePasswordCard() {
  const { user } = useAuth();
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.next !== form.confirm) {
      toast.error("Passwords do not match", {
        description: "New password and confirmation must be identical.",
      });
      return;
    }

    if (form.next.length < 6) {
      toast.error("Password too short", {
        description: "New password must be at least 6 characters.",
      });
      return;
    }

    setLoading(true);
    try {
      await api.patch("/auth/change-password", {
        currentPassword: form.current,
        newPassword:     form.next,
      });
      setSuccess(true);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccess(false), 4000);
      toast.success("Password updated", {
        description: "Your new password is active immediately.",
      });
    } catch (err) {
      toast.error("Failed to update password", { description: err?.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your login password. You will not be signed out.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <ShieldCheck className="h-10 w-10 text-emerald-500" />
            <p className="text-sm font-medium">Password updated successfully</p>
            <p className="text-xs text-muted-foreground">
              Use your new password the next time you sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current password */}
            <div className="space-y-1.5">
              <Label htmlFor="current">Current password</Label>
              <PasswordInput
                id="current"
                placeholder="Enter current password"
                required
                {...field("current")}
              />
            </div>

            {/* New password + strength */}
            <div className="space-y-1.5">
              <Label htmlFor="next">New password</Label>
              <PasswordInput
                id="next"
                placeholder="Choose a strong password"
                required
                {...field("next")}
              />
              <PasswordStrength password={form.next} />
            </div>

            {/* Confirm */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm new password</Label>
              <PasswordInput
                id="confirm"
                placeholder="Repeat new password"
                required
                {...field("confirm")}
              />
              {/* Mismatch warning */}
              {form.confirm && form.next !== form.confirm && (
                <p className="text-[11px] text-destructive mt-1">
                  Passwords do not match.
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                loading ||
                !form.current ||
                !form.next    ||
                !form.confirm ||
                form.next !== form.confirm
              }
            >
              {loading ? "Updating…" : "Update Password"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ── Account info (read-only) ──────────────────────────────────────────────────

function AccountInfoCard() {
  const { user } = useAuth();
  const rows = [
    { label: "Full name", value: user?.fullName },
    { label: "Email",     value: user?.email    },
    { label: "Role",      value: user?.role?.charAt(0) + user?.role?.slice(1).toLowerCase() },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Account Information</CardTitle>
        <CardDescription>Your profile details managed by the administrator.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between
                                        rounded-lg border px-4 py-2.5">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function SettingsTab() {
  return (
    <div className="max-w-lg space-y-4">
      <AccountInfoCard />
      <ThemeToggle />
      <ChangePasswordCard />
    </div>
  );
}