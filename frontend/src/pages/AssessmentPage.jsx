import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Grid,
  Filter,
  Brain,
  Atom,
  TrendingUp,
  Palette,
  Globe,
  Wrench,
  RotateCcw,
  AlertCircle,
  X,
  FastForward,
} from "lucide-react";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import useAuth from "../hooks/useAuth";
import { fetchQuestions, submitAssessment } from "../services/platformService";

const DRAFT_KEY = "vidyamargdarshak_assessment_answers";

const CATEGORIES = [
  { id: "all", label: "All Questions", icon: Grid },
  { id: "logic", label: "Logic & Math", icon: Brain },
  { id: "science", label: "Science & Tech", icon: Atom },
  { id: "commerce", label: "Commerce & Biz", icon: TrendingUp },
  { id: "creativity", label: "Creativity & Art", icon: Palette },
  { id: "social", label: "Social & Law", icon: Globe },
  { id: "practical", label: "Practical & Voc", icon: Wrench },
];

const CATEGORY_MAP = {
  logic: { label: "Logic & Reasoning", icon: Brain, color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  science: { label: "Science & Technology", icon: Atom, color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  commerce: { label: "Commerce & Finance", icon: TrendingUp, color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  creativity: { label: "Creativity & Design", icon: Palette, color: "bg-purple-100 text-purple-800 border-purple-200" },
  social: { label: "Social Sciences & Law", icon: Globe, color: "bg-amber-100 text-amber-800 border-amber-200" },
  practical: { label: "Practical & Applied", icon: Wrench, color: "bg-orange-100 text-orange-800 border-orange-200" },
};

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
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPalette, setShowPalette] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const classLevel = user?.classLevel || "10";
    fetchQuestions({ classLevel })
      .then(setQuestions)
      .finally(() => setLoading(false));
  }, [user]);

  // Persist draft answers to localStorage
  useEffect(() => {
    try {
      if (Object.keys(answers).length > 0) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
      }
    } catch (e) {
      console.warn("Could not save assessment draft", e);
    }
  }, [answers]);

  if (loading) {
    return (
      <SectionCard className="max-w-3xl mx-auto text-center py-16">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-800 animate-spin mb-4">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-lg font-bold text-slate-800">Loading comprehensive assessment test...</p>
        <p className="text-sm text-slate-500 mt-1">Preparing 60+ evaluation questions tailored for your level.</p>
      </SectionCard>
    );
  }

  // Filtered list of questions based on active tab
  const filteredQuestions = selectedCategory === "all"
    ? questions
    : questions.filter((q) => q.category === selectedCategory);

  const activeQuestionList = filteredQuestions.length > 0 ? filteredQuestions : questions;
  const safeIndex = Math.min(currentIndex, activeQuestionList.length - 1);
  const currentQuestion = activeQuestionList[safeIndex];

  // Stats calculation
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const isClass10 = !user?.classLevel || user?.classLevel === "10";

  const handleSelectOption = (value) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion._id]: value }));
  };

  const handleJumpToNextUnanswered = () => {
    const nextUnansweredIdx = questions.findIndex((q) => !answers[q._id]);
    if (nextUnansweredIdx !== -1) {
      if (selectedCategory !== "all") {
        setSelectedCategory("all");
      }
      setCurrentIndex(nextUnansweredIdx);
    }
  };

  const handleResetAnswers = () => {
    if (window.confirm("Are you sure you want to clear all answered questions and start fresh?")) {
      setAnswers({});
      localStorage.removeItem(DRAFT_KEY);
      setCurrentIndex(0);
    }
  };

  const handleSubmit = async () => {
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered questions out of ${totalQuestions}.\n\nDo you want to submit your assessment anyway?`
      );
      if (!confirmSubmit) return;
    }

    const payload = {
      answers: questions
        .filter((q) => answers[q._id])
        .map((question) => ({
          questionId: question._id,
          optionValue: answers[question._id],
        })),
    };

    if (payload.answers.length === 0) {
      alert("Please answer at least one question before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await submitAssessment(payload);
      localStorage.removeItem(DRAFT_KEY);
      navigate("/results");
    } catch (err) {
      alert(err.message || "Failed to submit assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategoryMeta = CATEGORY_MAP[currentQuestion?.category] || {
    label: currentQuestion?.category || "General",
    icon: Sparkles,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  };
  const CategoryIcon = currentCategoryMeta.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <SectionCard className="!p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-900 to-indigo-800 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                {isClass10 ? "Class 10 Stream Selection Assessment" : "Career Aptitude Assessment"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {totalQuestions} Total Questions
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Read each statement and rate your interest. Your responses help generate personalized stream and career pathways.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setShowPalette(!showPalette)}
              className="flex items-center gap-2 text-xs font-bold py-2"
            >
              <Grid className="h-4 w-4 text-blue-700" />
              Question Navigator ({answeredCount}/{totalQuestions})
            </Button>
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={handleResetAnswers}
                title="Reset answers"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Status line */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Overall Completion: {progressPercent}%</span>
            <span>
              {answeredCount} Answered &bull;{" "}
              <span className={unansweredCount > 0 ? "text-amber-600" : "text-emerald-600"}>
                {unansweredCount} Remaining
              </span>
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter by Domain:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = cat.id === "all"
                ? questions.length
                : questions.filter((q) => q.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentIndex(0);
                  }}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                  <span className={`ml-1 rounded-md px-1.5 py-0.2 text-[10px] ${isSelected ? "bg-blue-800 text-cyan-200" : "bg-slate-200 text-slate-600"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* Question Palette Modal / Drawer */}
      {showPalette && (
        <SectionCard className="!p-6 bg-slate-900 text-white rounded-3xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Grid className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Question Navigator Palette</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowPalette(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 mb-4 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" /> Answered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-blue-500 inline-block" /> Current
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-slate-700 border border-slate-600 inline-block" /> Unanswered
              </span>
            </div>
            {unansweredCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  handleJumpToNextUnanswered();
                  setShowPalette(false);
                }}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
              >
                <FastForward className="h-3.5 w-3.5" /> Jump to Unanswered
              </button>
            )}
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-2 max-h-64 overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(answers[q._id]);
              const isCurrent = currentQuestion?._id === q._id;

              let style = "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700";
              if (isAnswered) {
                style = "bg-emerald-600 text-white font-bold border-emerald-500 shadow-sm";
              }
              if (isCurrent) {
                style = "bg-blue-600 text-white font-black ring-2 ring-cyan-400 border-blue-400 scale-105 z-10";
              }

              return (
                <button
                  key={q._id}
                  type="button"
                  onClick={() => {
                    if (selectedCategory !== "all" && q.category !== selectedCategory) {
                      setSelectedCategory("all");
                    }
                    const targetIdx = questions.findIndex((item) => item._id === q._id);
                    setCurrentIndex(targetIdx !== -1 ? targetIdx : 0);
                    setShowPalette(false);
                  }}
                  className={`h-9 w-full rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${style}`}
                  title={`Q${idx + 1}: ${q.question.substring(0, 40)}...`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Main Question Card */}
      <SectionCard className="!p-6 sm:!p-8 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${currentCategoryMeta.color}`}>
              <CategoryIcon className="h-3.5 w-3.5" />
              {currentCategoryMeta.label}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Question {questions.findIndex((q) => q._id === currentQuestion?._id) + 1} of {totalQuestions}
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] bg-slate-50/90 border border-slate-200/90 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-blue-900 text-sm font-black text-white shadow-md shadow-blue-900/20">
              {questions.findIndex((q) => q._id === currentQuestion?._id) + 1}
            </span>
            <p className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
              {currentQuestion?.question}
            </p>
          </div>

          <div className="mt-8 grid gap-3">
            {currentQuestion?.options.map((option) => {
              const isSelected = answers[currentQuestion._id] === option.value;
              const style = getLikertStyle(option.label, isSelected);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectOption(option.value)}
                  className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm font-bold transition-all cursor-pointer ${style}`}
                >
                  <span>{option.label}</span>
                  {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0 text-white ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              type="button"
              disabled={safeIndex === 0}
              onClick={() => setCurrentIndex((val) => Math.max(0, val - 1))}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {unansweredCount > 0 && (
              <button
                type="button"
                onClick={handleJumpToNextUnanswered}
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl px-3 py-2 transition cursor-pointer"
              >
                <FastForward className="h-3.5 w-3.5" /> Next Unanswered
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {safeIndex < activeQuestionList.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentIndex((val) => val + 1)}
                className="flex items-center gap-1.5"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-2 px-6 shadow-lg shadow-emerald-700/20"
              >
                {submitting ? "Analyzing 60+ Responses..." : "Complete & View Recommendation"}
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}


