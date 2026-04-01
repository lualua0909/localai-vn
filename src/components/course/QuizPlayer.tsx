"use client";

import { useState } from "react";
import type { QuizData } from "@/lib/course-data";
import { useLanguage, useTranslations } from "@/lib/i18n";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface QuizPlayerProps {
  quizData: QuizData;
  onComplete: (score: number, totalQuestions: number, passed: boolean) => void;
}

export function QuizPlayer({ quizData, onComplete }: QuizPlayerProps) {
  const t = useTranslations("courses");
  const { language } = useLanguage();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    let correct = 0;
    for (const q of quizData.questions) {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    }
    setScore(correct);
    setSubmitted(true);

    const percentage = Math.round((correct / quizData.questions.length) * 100);
    const passed = percentage >= quizData.passingScore;
    onComplete(correct, quizData.questions.length, passed);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const allAnswered =
    Object.keys(selectedAnswers).length === quizData.questions.length;
  const percentage =
    quizData.questions.length > 0
      ? Math.round((score / quizData.questions.length) * 100)
      : 0;
  const passed = percentage >= quizData.passingScore;

  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-card-bg)]">
      <div className="border-b border-[var(--color-border)] bg-gradient-to-br from-accent/10 via-transparent to-transparent px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              Quiz
            </p>
            <h3 className="typo-h2 mt-1">{t.player.quizTitle}</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {language === "vi"
                ? `${quizData.questions.length} câu hỏi • ${quizData.passingScore}% để đạt`
                : `${quizData.questions.length} questions • ${quizData.passingScore}% to pass`}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/75 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
              {submitted ? t.player.quizScore : language === "vi" ? "Sẵn sàng" : "Ready"}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {submitted
                ? `${score}/${quizData.questions.length} (${percentage}%)`
                : `${Object.keys(selectedAnswers).length}/${quizData.questions.length}`}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
      {submitted && (
        <div
          className={`p-4 rounded-xl border ${
            passed
              ? "bg-green-500/10 border-green-500/20"
              : "bg-red-500/10 border-red-500/20"
          }`}
        >
          <div className="flex items-center gap-3">
            {passed ? (
              <CheckCircle size={24} className="text-green-600" />
            ) : (
              <XCircle size={24} className="text-red-500" />
            )}
            <div>
              <p className="typo-body font-semibold">
                {t.player.quizScore}: {score}/{quizData.questions.length} ({percentage}
                %)
              </p>
              <p className="typo-caption text-[var(--color-text-secondary)]">
                {passed ? t.player.quizPassed : t.player.quizFailed}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {quizData.questions.map((q, qIndex) => {
          const selected = selectedAnswers[q.id];
          const isCorrect = submitted && selected === q.correctIndex;
          const isWrong = submitted && selected !== undefined && selected !== q.correctIndex;

          return (
            <div key={q.id} className="space-y-3">
              <p className="typo-body font-semibold">
                <span className="text-accent mr-2">Q{qIndex + 1}.</span>
                {q.question}
              </p>

              <div className="space-y-2 pl-4">
                {q.options.map((option, oIndex) => {
                  const isSelected = selected === oIndex;
                  const isThisCorrect = submitted && oIndex === q.correctIndex;
                  const isThisWrong = submitted && isSelected && oIndex !== q.correctIndex;

                  let optionClass =
                    "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ";
                  if (isThisCorrect) {
                    optionClass +=
                      "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400";
                  } else if (isThisWrong) {
                    optionClass +=
                      "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400";
                  } else if (isSelected && !submitted) {
                    optionClass +=
                      "bg-accent/10 border-accent/30 text-accent";
                  } else {
                    optionClass +=
                      "border-[var(--color-border)] hover:border-accent/30 hover:bg-accent/5";
                  }

                  if (submitted) optionClass += " cursor-default";

                  return (
                    <div
                      key={oIndex}
                      onClick={() => handleSelect(q.id, oIndex)}
                      className={optionClass}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-current bg-current/20"
                            : "border-[var(--color-border)]"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      <span className="typo-body">{option}</span>
                      {submitted && isThisCorrect && (
                        <CheckCircle size={16} className="ml-auto text-green-600" />
                      )}
                      {submitted && isThisWrong && (
                        <XCircle size={16} className="ml-auto text-red-500" />
                      )}
                    </div>
                  );
                })}
              </div>

              {submitted && q.explanation && (
                <p className="pl-4 typo-caption text-[var(--color-text-secondary)] italic">
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {submitted ? (
          <Button variant="outline" onClick={handleRetry} className="gap-2">
            <RotateCcw size={16} />
            {t.player.retryQuiz}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!allAnswered}
          >
            {t.player.submitQuiz}
          </Button>
        )}
      </div>
      </div>
    </div>
  );
}
