import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import { fetchAssessmentForm, submitAssessment } from "../services/platformService";

const shuffle = (items) => {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) { const pick = Math.floor(Math.random() * (index + 1)); [next[index], next[pick]] = [next[pick], next[index]]; }
  return next;
};
export default function AssessmentPage() {
  const navigate = useNavigate(); const [data, setData] = useState(null); const [section, setSection] = useState("intro"); const [index, setIndex] = useState(0); const [language, setLanguage] = useState("en"); const [interest, setInterest] = useState({}); const [profile, setProfile] = useState({}); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState("");
  useEffect(() => { fetchAssessmentForm().then(payload => { setData({ ...payload, shuffledQuestions: shuffle(payload.form.questions) }); if (payload.alreadyAttempted) setTimeout(() => navigate("/results"), 3000); }).catch(() => setError("Unable to load the assessment.")); }, [navigate]);
  if (error) return <SectionCard>{error}</SectionCard>; if (!data) return <SectionCard>Loading assessment...</SectionCard>; if (data.alreadyAttempted) return <SectionCard><p className="section-title">Assessment already completed</p><p className="mt-2 text-sm text-slate-600">Redirecting to your report in 3 seconds...</p></SectionCard>;
  const questions = section === "interest" ? data.shuffledQuestions : data.profileQuestions; const question = questions[index]; const isInterest = section === "interest"; const currentAnswer = isInterest ? interest[question?.questionId] : profile[question?.questionId]; const answered = isInterest ? currentAnswer !== undefined : Array.isArray(currentAnswer) && currentAnswer.length > 0;
  const chooseProfile = value => { const current = profile[question.questionId] || []; const multiple = question.questionType === "MULTIPLE_SELECT"; setProfile({ ...profile, [question.questionId]: multiple ? (current.includes(value) ? current.filter(item => item !== value) : [...current, value]) : [value] }); };
  const finish = async () => { setSubmitting(true); setError(""); try { await submitAssessment({ language, interestResponses: data.form.questions.map(questionItem => ({ questionId: questionItem.questionId, value: interest[questionItem.questionId] })), profileResponses: data.profileQuestions.map(questionItem => ({ questionId: questionItem.questionId, values: profile[questionItem.questionId] })) }); navigate("/results"); } catch (requestError) { setError(requestError.response?.data?.message || "Unable to save the assessment. Please try again."); } finally { setSubmitting(false); } };
  if (section === "intro") {
    return (
      <SectionCard>
        <p className="section-title">
          {data.assessmentType === "AFTER12"
            ? `After-12th ${data.form.stream} Assessment`
            : "After-10th Assessment"}
        </p>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          Your interest scores are calculated securely by the platform. You can switch language on every question.
        </p>
        <div className="mt-5 sm:mt-6 grid max-w-md gap-2.5 sm:gap-3 sm:grid-cols-2">
          <Button
            variant={language === "en" ? "primary" : "secondary"}
            onClick={() => setLanguage("en")}
            className="w-full py-2.5 text-xs sm:text-sm"
          >
            English
          </Button>
          <Button
            variant={language === "mr" ? "primary" : "secondary"}
            onClick={() => setLanguage("mr")}
            className="w-full py-2.5 text-xs sm:text-sm"
          >
            मराठी
          </Button>
        </div>
        <Button className="mt-5 sm:mt-6 w-full sm:w-auto py-2.5 px-5 text-sm font-bold shadow-sm" onClick={() => setSection("interest")}>
          Begin assessment
        </Button>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      {/* Question Header & Language Switcher */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-title">
            {isInterest ? "Interest Assessment" : "Academic & Learning Profile"}
          </p>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
            Question {index + 1} of {questions.length}
          </p>
        </div>
        <Button
          variant="secondary"
          className="shrink-0 py-1.5 px-3 text-xs sm:text-sm font-semibold border-slate-300"
          onClick={() => setLanguage(language === "en" ? "mr" : "en")}
        >
          {language === "en" ? "मराठी" : "English"}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 sm:mt-5 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-700 transition-all duration-300"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="mt-5 sm:mt-7 rounded-2xl sm:rounded-3xl bg-slate-50 p-4 sm:p-6 border border-slate-100">
        <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {question.text[language] || question.text.en}
        </p>

        {/* Options */}
        <div className="mt-4 sm:mt-5 grid gap-2.5 sm:gap-3">
          {(isInterest ? data.form.responseScale : question.options).map((option) => {
            const selected = isInterest
              ? interest[question.questionId] === option.value
              : (profile[question.questionId] || []).includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  isInterest
                    ? setInterest({ ...interest, [question.questionId]: option.value })
                    : chooseProfile(option.value)
                }
                className={`rounded-xl sm:rounded-2xl border px-3.5 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm transition-all duration-150 cursor-pointer active:scale-[0.99] leading-snug ${
                  selected
                    ? "border-blue-800 bg-blue-900 text-white font-semibold shadow-sm"
                    : "border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50/40"
                }`}
              >
                {option.label[language] || option.label.en}
              </button>
            );
          })}
        </div>
      </div>

      {error ? <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-rose-600 font-medium">{error}</p> : null}

      {/* Navigation Controls */}
      <div className="mt-5 sm:mt-7 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
          className="py-2 sm:py-2.5 px-3.5 sm:px-4 text-xs sm:text-sm"
        >
          Previous
        </Button>

        {index < questions.length - 1 ? (
          <Button
            disabled={!answered}
            onClick={() => setIndex(index + 1)}
            className="py-2 sm:py-2.5 px-4 sm:px-5 text-xs sm:text-sm font-bold shadow-sm"
          >
            Next
          </Button>
        ) : isInterest && data.profileQuestions.length ? (
          <Button
            disabled={!answered}
            onClick={() => {
              setSection("profile");
              setIndex(0);
            }}
            className="py-2 sm:py-2.5 px-4 sm:px-5 text-xs sm:text-sm font-bold shadow-sm"
          >
            Continue to profile
          </Button>
        ) : (
          <Button
            disabled={!answered || submitting}
            onClick={finish}
            className="py-2 sm:py-2.5 px-4 sm:px-5 text-xs sm:text-sm font-bold shadow-sm"
          >
            {submitting ? "Saving..." : "Finish assessment"}
          </Button>
        )}
      </div>
    </SectionCard>
  );
}
