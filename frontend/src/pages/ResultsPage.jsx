import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionCard from "../components/ui/SectionCard";
import StreamScoreChart from "../components/charts/StreamScoreChart";
import Button from "../components/ui/Button";
import {
  fetchRecommendedCareers,
  fetchRecommendedCourses,
  fetchRecommendedResources,
  fetchStreamRecommendation,
} from "../services/platformService";

export default function ResultsPage() {
  const [state, setState] = useState({
    recommendation: null,
    courses: [],
    careers: [],
    resources: [],
  });

  useEffect(() => {
    Promise.all([
      fetchStreamRecommendation(),
      fetchRecommendedCourses(),
      fetchRecommendedCareers(),
      fetchRecommendedResources(),
    ])
      .then(([recommendation, courses, careers, resources]) =>
        setState({ recommendation, courses, careers, resources })
      )
      .catch(() => null);
  }, []);

  if (!state.recommendation) {
    return (
      <SectionCard>
        <p className="section-title">No results yet</p>
        <p className="mt-2 text-sm text-slate-600">Complete the assessment first to unlock recommendations.</p>
        <Link to="/assessment" className="mt-4 inline-flex">
          <Button>Take the assessment</Button>
        </Link>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">Recommendation Result</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">
          Recommended Stream: {state.recommendation.stream}
        </h1>
        <div className="mt-4 space-y-2">
          {state.recommendation.explanation.map((item) => (
            <p key={item} className="text-sm leading-7 text-slate-600">
              {item}
            </p>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <SectionCard>
          <p className="section-title">Score Breakdown</p>
          <div className="mt-6 h-80">
            <StreamScoreChart scores={state.recommendation.scores} />
          </div>
        </SectionCard>

        <SectionCard>
          <p className="section-title">Why this fits</p>
          <div className="mt-5 space-y-3">
            {Object.entries(state.recommendation.scores).map(([stream, score]) => (
              <div key={stream} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{stream}</p>
                  <p className="text-sm font-semibold text-blue-800">{score}/100</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard>
          <p className="section-title">Suggested Courses</p>
          <div className="mt-4 space-y-3">
            {state.courses.slice(0, 4).map((course) => (
              <div key={course._id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{course.name}</p>
                <p className="mt-1 text-sm text-slate-600">{course.duration}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="section-title">Career Paths</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {state.careers.slice(0, 8).map((career) => (
              <span key={career.title} className="rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-900">
                {career.title}
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="section-title">Study Resources</p>
          <div className="mt-4 space-y-3">
            {state.resources.map((resource) => (
              <a
                key={resource._id}
                href={resource.link}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-slate-200 p-4"
              >
                <p className="font-semibold text-slate-900">{resource.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {resource.format} • {resource.language}
                </p>
              </a>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
