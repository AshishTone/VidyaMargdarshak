import { ArrowRight, BookOpen, ClipboardList, School, Compass, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import useAuth from "../hooks/useAuth";

const featureCards = [
  {
    title: "Take my up-to-date assessment",
    copy: "Answer guided questions about mathematics, design, people, computers, and work style.",
    icon: ClipboardList,
    detail:
      "The assessment is the first intelligence layer in VidyaMargdarshak. It scores your interests and aptitude in an explainable way so later recommendations and roadmaps feel earned, not random.",
  },
  {
    title: "Explore real course paths",
    copy: "Understand what each course teaches, the jobs it opens up, and the exams or higher studies linked to it.",
    icon: BookOpen,
    detail:
      "Every course path shows what you study, what it can lead to, which exams matter, and how to think about the next step after graduation or diploma completion.",
  },
  {
    title: "Find nearby colleges",
    copy: "Browse curated college cards with facilities, fees range, language options, and source labels.",
    icon: School,
    detail:
      "Browse curated college cards with facilities, fee ranges, language options, and source levels.",
  },
];

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(null);
  const { user } = useAuth();

  return (
    <div className="min-h-screen px-3 py-5 sm:px-8">
      {activeFeature ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-md">
          <div className="panel relative w-full max-w-xl rounded-[2rem] p-8">
            <button
              className="absolute right-5 top-5 rounded-xl border border-slate-200 p-2 cursor-pointer hover:bg-slate-100"
              onClick={() => setActiveFeature(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <activeFeature.icon className="h-12 w-12 rounded-2xl bg-blue-100 p-3 text-blue-900" />
            <h3 className="mt-5 text-3xl font-bold text-slate-950">{activeFeature.title}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">{activeFeature.detail}</p>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-[96%] xl:max-w-[115rem]">
        <header className="flex items-center justify-between rounded-3xl border border-white/60 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
          <Link to="/" className="flex items-center gap-4">
            <img src="/logo.png" alt="VidyaMargdarshak logo" className="h-12 w-auto" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-800">
                VidyaMargdarshak
              </p>
              <h1 className="text-xl font-bold text-slate-900">Career & Education Advisor</h1>
            </div>
          </Link>

          <div className="flex gap-3">
            {user ? <Link to="/dashboard"><Button>Dashboard</Button></Link> : null}
            <Link to="/roadmaps/public">
              <Button variant="secondary">Public roadmap</Button>
            </Link>
            {!user ? <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link> : null}
            {!user ? <Link to="/signup">
              <Button>Sign up</Button>
            </Link> : null}
          </div>
        </header>

        <section className="grid gap-10 px-2 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-900">
              Built for students and parents
            </p>
            <h2 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
              Find your right career path with clarity, not confusion.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              VidyaMargdarshak guides students from self-discovery to stream fit, course choices,
              college discovery, and admission timelines in one clean workflow.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup">
                <Button className="gap-2 px-5 py-3">
                  Start your guidance journey
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="secondary" className="px-5 py-3">
                  See what&apos;s included
                </Button>
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="panel rounded-3xl p-5">
                <p className="text-3xl font-bold text-blue-900">Personalized</p>
                <p className="mt-2 text-sm text-slate-600">Guidance that adapts to your education level and profile.</p>
              </div>
              <div className="panel rounded-3xl p-5">
                <p className="text-3xl font-bold text-blue-900">Explainable</p>
                <p className="mt-2 text-sm text-slate-600">Rule-based recommendations students can actually understand.</p>
              </div>
              <div className="panel rounded-3xl p-5">
                <p className="text-3xl font-bold text-blue-900">Practical</p>
                <p className="mt-2 text-sm text-slate-600">Explore pathways, courses, and next steps with confidence.</p>
              </div>
            </div>
          </div>

          <div className="panel rounded-[2rem] p-6">
            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Student Flow</p>
              <ol className="mt-6 space-y-4 text-sm text-slate-200">
                <li>1. Sign up and fill in your class, interests, language, and location.</li>
                <li>2. Take a short aptitude and interest assessment, one question at a time.</li>
                <li>3. Unlock personalized suggestions and a student-specific roadmap graph.</li>
                <li>4. Explore matched courses, career outcomes, colleges, and deadlines.</li>
              </ol>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-6 pb-12 md:grid-cols-3">
          {featureCards.map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() => setActiveFeature(card)}
              className="panel group rounded-[1.8rem] p-6 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2.5xl hover:border-blue-400 hover:bg-white hover:ring-4 hover:ring-blue-100/70 cursor-pointer"
            >
              <card.icon className="h-10 w-10 rounded-2xl bg-blue-100 p-2 text-blue-900 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.copy}</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-800 group-hover:text-blue-600 transition-colors">
                <ArrowRight className="h-4 w-4" />
                Click to explore
              </div>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}
