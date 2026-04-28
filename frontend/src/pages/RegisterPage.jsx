import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  username: "",
  emailOrPhone: "",
  bgmiId: "",
  password: "",
  confirmPassword: "",
  role: "player",
  adminRegistrationKey: "",
};

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === "role"
        ? value === "player"
          ? { adminRegistrationKey: "" }
          : { bgmiId: "", adminRegistrationKey: current.adminRegistrationKey }
        : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setStatus({ loading: false, error: "Passwords do not match", success: "" });
      return;
    }

    setStatus({ loading: true, error: "", success: "" });

    try {
      const payload = {
        username: formData.username,
        emailOrPhone: formData.emailOrPhone,
        password: formData.password,
        role: formData.role,
        ...(formData.role === "player" ? { bgmiId: formData.bgmiId } : {}),
        ...(formData.role === "admin" ? { adminRegistrationKey: formData.adminRegistrationKey } : {}),
      };

      await register(payload);
      setStatus({ loading: false, error: "", success: "Registration successful. Redirecting..." });
      navigate("/", { replace: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  return (
    <section className="arena-container py-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="arena-card p-8 sm:p-10">
          <span className="arena-pill border-orange-500/35 bg-orange-500/10 text-arena-orange">New Account</span>
          <h1 className="mt-6 text-5xl font-bold leading-tight text-white sm:text-6xl">
            Create your BGMI Arena identity.
          </h1>
          <p className="mt-5 text-lg text-arena-muted sm:text-xl">
            Register once, join tournaments faster, track winnings, and keep your BGMI ID linked to every entry.
          </p>

          <div className="mt-10 space-y-4">
            {[
              "Use email or phone for one account across matches and wallet.",
              "Choose player registration by default, or admin if you have the platform key.",
              "Your BGMI ID is saved during signup so match joins stay quick.",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-arena-muted">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="arena-card p-8 sm:p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Register</h2>
            <p className="mt-2 text-arena-muted">Fill in your details and your account will be created immediately.</p>
          </div>

          <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
            <label className="auth-field sm:col-span-2">
              <span>Username</span>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="ArenaKing"
                required
              />
            </label>

            <label className="auth-field">
              <span>Email or Phone</span>
              <input
                name="emailOrPhone"
                type="text"
                value={formData.emailOrPhone}
                onChange={handleChange}
                placeholder="player@example.com"
                required
              />
            </label>

            {formData.role === "player" ? (
              <label className="auth-field">
                <span>BGMI ID</span>
                <input
                  name="bgmiId"
                  type="text"
                  value={formData.bgmiId}
                  onChange={handleChange}
                  placeholder="BGMI778899"
                  required
                />
              </label>
            ) : null}

            <label className={`auth-field ${formData.role === "admin" ? "sm:col-span-2" : ""}`}>
              <span>Password</span>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                minLength="6"
                required
              />
            </label>

            <label className={`auth-field ${formData.role === "admin" ? "sm:col-span-2" : ""}`}>
              <span>Confirm Password</span>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                minLength="6"
                required
              />
            </label>

            <label className="auth-field sm:col-span-2">
              <span>Account Type</span>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="player">Player</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {formData.role === "admin" ? (
              <label className="auth-field sm:col-span-2">
                <span>Admin Registration Key</span>
                <input
                  name="adminRegistrationKey"
                  type="password"
                  value={formData.adminRegistrationKey}
                  onChange={handleChange}
                  placeholder="Enter the admin key"
                  required
                />
              </label>
            ) : null}

            {status.error ? <p className="sm:col-span-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{status.error}</p> : null}
            {status.success ? (
              <p className="sm:col-span-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {status.success}
              </p>
            ) : null}

            <button type="submit" className="btn-primary sm:col-span-2" disabled={status.loading}>
              {status.loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-arena-muted">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-white transition hover:text-arena-orange">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
