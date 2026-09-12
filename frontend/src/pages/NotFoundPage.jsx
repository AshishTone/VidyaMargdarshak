import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel rounded-[2rem] p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-800">404</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">The page you requested does not exist.</p>
        <Link to="/" className="mt-6 inline-flex">
          <Button>Return home</Button>
        </Link>
      </div>
    </div>
  );
}
