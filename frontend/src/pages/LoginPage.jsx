import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  emailOrPhone: "",
  password: "",
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      await login(formData);
      setStatus({ loading: false, error: "", success: "Login successful. Redirecting..." });
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  return (
    <section className="arena-container flex min-h-[calc(100vh-88px)] items-center py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="arena-card relative overflow-hidden p-8 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,106,0,0.18),transparent_35%)]" />
          <div className="relative">
            <span className="arena-pill border-orange-500/35 bg-orange-500/10 text-arena-orange">Player Access</span>
            <h1 className="mt-6 text-5xl font-bold leading-tight text-white sm:text-6xl">
              Log in and jump back into the arena.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-arena-muted sm:text-xl">
              Enter your email or phone, unlock your wallet, and queue for the next BGMI match in seconds.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Fast access", value: "1 tap" },
                { label: "Prize tracking", value: "24/7" },
                { label: "Secure wallet", value: "JWT" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-3xl font-bold text-white">{item.value}</div>
                  <div className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-arena-muted">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="arena-card p-8 sm:p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Login</h2>
            <p className="mt-2 text-arena-muted">Use the same email or phone number you registered with.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Email or Phone</span>
              <input
                name="emailOrPhone"
                type="text"
                value={formData.emailOrPhone}
                onChange={handleChange}
                placeholder="player@example.com or 9876543210"
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </label>

            {status.error ? <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{status.error}</p> : null}
            {status.success ? (
              <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {status.success}
              </p>
            ) : null}

            <button type="submit" className="btn-primary w-full" disabled={status.loading}>
              {status.loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-arena-muted">
            New here?{" "}
            <Link to="/register" className="font-semibold text-white transition hover:text-arena-orange">
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
