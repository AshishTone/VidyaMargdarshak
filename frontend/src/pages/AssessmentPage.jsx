import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Sparkles, HelpCircle, ArrowRight, ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import useAuth from "../hooks/useAuth";
import { fetchQuestions, submitAssessment } from "../services/platformService";

const getLikertStyle = (label, isSelected) => {
  const norm = (label || "").toLowerCase();

  if (norm.includes("strongly agree")) {
    return isSelected
      ? "border-emerald-600 bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 ring-2 ring-emerald-500"
      : "border-slate-200 bg-white text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40";
  }
  if (norm.includes("agree")) {
    return isSelected
      ? "border-blue-600 bg-blue-800 text-white shadow-lg shadow-blue-800/20 ring-2 ring-blue-500"
      : "border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50/40";
  }
  if (norm.includes("neutral")) {
    return isSelected
      ? "border-slate-600 bg-slate-700 text-white shadow-lg shadow-slate-700/20 ring-2 ring-slate-400"
      : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50";
  }
  if (norm.includes("strongly disagree")) {
    return isSelected
      ? "border-rose-600 bg-rose-700 text-white shadow-lg shadow-rose-700/20 ring-2 ring-rose-500"
      : "border-slate-200 bg-white text-slate-800 hover:border-rose-400 hover:bg-rose-50/40";
  }
  if (norm.includes("disagree")) {
    return isSelected
      ? "border-amber-600 bg-amber-700 text-white shadow-lg shadow-amber-700/20 ring-2 ring-amber-500"
      : "border-slate-200 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50/40";
  }

  return isSelected
    ? "border-blue-700 bg-blue-900 text-white"
    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300";
};

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const classLevel = user?.classLevel || "10";
    fetchQuestions({ classLevel })
      .then(setQuestions)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <SectionCard>Loading assessment questions...</SectionCard>;
  }

  const currentQuestion = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isClass10 = !user?.classLevel || user?.classLevel === "10";

  const handleSelectOption = (value) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion._id]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      answers: questions.map((question) => ({
        questionId: question._id,
        optionValue: answers[question._id],
      })),
    };

    setSubmitting(true);
    await submitAssessment(payload);
    navigate("/results");
  };

  return (
    <SectionCard className="max-w-3xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-900">
              <Sparkles className="h-3.5 w-3.5" />
              {isClass10 ? "Class 10 Stream Selection Assessment" : "Aptitude Assessment"}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {isClass10
              ? "Read each statement carefully and select how strongly you agree or disagree."
              : "One question at a time, simple and focused."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Progress</p>
          <p className="text-base font-black text-blue-900">
            {currentIndex + 1} <span className="text-slate-400 font-medium">/ {questions.length}</span>
          </p>
        </div>
      </div>

      <div className="mb-8 h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="rounded-[2rem] bg-slate-50/80 border border-slate-200/80 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-900 text-xs font-black text-white">
            {currentIndex + 1}
          </span>
          <p className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
            {currentQuestion?.question}
          </p>
        </div>

        <div className="mt-6 grid gap-3">
          {currentQuestion?.options.map((option) => {
            const isSelected = answers[currentQuestion._id] === option.value;
            const style = getLikertStyle(option.label, isSelected);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectOption(option.value)}
                className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition-all cursor-pointer ${style}`}
              >
                <span>{option.label}</span>
                {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-white ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Button
          variant="secondary"
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((value) => value - 1)}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            type="button"
            disabled={!answers[currentQuestion?._id]}
            onClick={() => setCurrentIndex((value) => value + 1)}
            className="flex items-center gap-1.5"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            disabled={!answers[currentQuestion?._id] || submitting}
            onClick={handleSubmit}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-2"
          >
            {submitting ? "Analyzing Responses..." : "Complete & See Results"}
            <Sparkles className="h-4 w-4" />
          </Button>
        )}
      </div>
    </SectionCard>
  );
}

