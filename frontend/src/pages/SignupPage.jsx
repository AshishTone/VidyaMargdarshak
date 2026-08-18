import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import useAuth from "../hooks/useAuth";

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(form);
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="panel w-full max-w-lg rounded-[2rem] p-8">
        <img src="/logo.png" alt="VidyaMargdarshak logo" className="h-14 w-auto" />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-blue-800">Sign up</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Create your student profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Start with a basic account. Right after signup, completing your student profile is mandatory for personalized guidance.
        </p>

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
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
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-blue-800" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
