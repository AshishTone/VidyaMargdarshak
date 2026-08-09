import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import { fetchQuestions, submitAssessment } from "../services/platformService";

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions()
      .then(setQuestions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <SectionCard>Loading assessment questions...</SectionCard>;
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

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
    <SectionCard>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="section-title">Aptitude & Interest Assessment</p>
          <p className="mt-2 text-sm text-slate-600">One question at a time, simple and focused.</p>
        </div>
        <p className="text-sm font-semibold text-blue-900">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>

      <div className="mb-8 h-3 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#1e3a8a,#60a5fa)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="rounded-[1.8rem] bg-slate-50 p-6">
        <p className="text-lg font-bold text-slate-900">{currentQuestion.question}</p>
        <div className="mt-5 grid gap-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setAnswers({ ...answers, [currentQuestion._id]: option.value })}
              className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
                answers[currentQuestion._id] === option.value
                  ? "border-blue-700 bg-blue-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Button
          variant="secondary"
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((value) => value - 1)}
        >
          Previous
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            type="button"
            disabled={!answers[currentQuestion._id]}
            onClick={() => setCurrentIndex((value) => value + 1)}
          >
            Next
          </Button>
        ) : (
          <Button type="button" disabled={!answers[currentQuestion._id] || submitting} onClick={handleSubmit}>
            {submitting ? "Submitting..." : "See results"}
          </Button>
        )}
      </div>
    </SectionCard>
  );
}
