import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(form);
      navigate(loggedInUser.profileCompleted ? "/dashboard" : "/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="panel w-full max-w-md rounded-[2rem] p-8">
        <img src="/logo.png" alt="VidyaMargdarshak logo" className="h-14 w-auto" />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-blue-800">Login</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Continue your guidance journey</h1>
        <p className="mt-2 text-sm text-slate-600">Use your student account to view assessment results, roadmaps, and saved colleges.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"
            placeholder="Email address"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button className="w-full py-3" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link className="font-semibold text-blue-800" to="/signup">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
