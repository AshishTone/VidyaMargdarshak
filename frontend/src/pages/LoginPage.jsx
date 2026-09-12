import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center px-3.5 py-6 sm:px-4 sm:py-8">
      <div className="panel w-full max-w-md rounded-2xl sm:rounded-[2rem] p-5 sm:p-8">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <Link to="/" title="VidyaMargdarshak Home">
            <img src="/logo.png" alt="VidyaMargdarshak logo" className="h-10 sm:h-12 w-auto" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-xs font-semibold transition-all group shadow-xs cursor-pointer"
            title="Go back to landing page"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </Link>
        </div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-blue-800">Login</p>
        <h1 className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-slate-950">Continue your guidance journey</h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">Use your student account to view assessment results, roadmaps, and saved colleges.</p>

        <form className="mt-6 sm:mt-8 space-y-3.5 sm:space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-4 py-2.5 sm:py-3 text-base sm:text-sm outline-none focus:border-blue-400"
            placeholder="Email address"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-4 py-2.5 sm:py-3 text-base sm:text-sm outline-none focus:border-blue-400"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          {error ? <p className="text-xs sm:text-sm text-rose-600">{error}</p> : null}
          <Button className="w-full py-2.5 sm:py-3 text-sm font-bold shadow-sm" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <p className="mt-5 sm:mt-6 text-xs sm:text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link className="font-semibold text-blue-800" to="/signup">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
