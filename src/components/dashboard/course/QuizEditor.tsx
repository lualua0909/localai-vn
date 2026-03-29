"use client";

import { useState } from "react";
import type { QuizData, QuizQuestion } from "@/lib/course-data";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface QuizEditorProps {
  value: QuizData;
  onChange: (data: QuizData) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function QuizEditor({ value, onChange }: QuizEditorProps) {
  const addQuestion = () => {
    onChange({
      ...value,
      questions: [
        ...value.questions,
        {
          id: generateId(),
          question: "",
          options: ["", "", "", ""],
          correctIndex: 0,
          explanation: "",
        },
      ],
    });
  };

  const updateQuestion = (index: number, q: Partial<QuizQuestion>) => {
    const updated = [...value.questions];
    updated[index] = { ...updated[index], ...q };
    onChange({ ...value, questions: updated });
  };

  const removeQuestion = (index: number) => {
    onChange({
      ...value,
      questions: value.questions.filter((_, i) => i !== index),
    });
  };

  const updateOption = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...value.questions];
    const options = [...updated[qIndex].options];
    options[oIndex] = text;
    updated[qIndex] = { ...updated[qIndex], options };
    onChange({ ...value, questions: updated });
  };

  const addOption = (qIndex: number) => {
    const updated = [...value.questions];
    updated[qIndex] = {
      ...updated[qIndex],
      options: [...updated[qIndex].options, ""],
    };
    onChange({ ...value, questions: updated });
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...value.questions];
    const options = updated[qIndex].options.filter((_, i) => i !== oIndex);
    let correctIndex = updated[qIndex].correctIndex;
    if (correctIndex >= options.length) correctIndex = 0;
    updated[qIndex] = { ...updated[qIndex], options, correctIndex };
    onChange({ ...value, questions: updated });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="typo-caption font-semibold">
          Quiz ({value.questions.length} questions)
        </label>
        <div className="flex items-center gap-3">
          <label className="typo-caption text-[var(--color-text-secondary)]">
            Passing score:
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={value.passingScore}
            onChange={(e) =>
              onChange({ ...value, passingScore: Number(e.target.value) })
            }
            className="w-16 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-1.5 typo-caption text-center outline-none"
          />
          <span className="typo-caption text-[var(--color-text-secondary)]">%</span>
        </div>
      </div>

      {value.questions.map((q, qIndex) => (
        <div
          key={q.id}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]/30 p-4 space-y-3"
        >
          <div className="flex items-start gap-2">
            <GripVertical
              size={16}
              className="text-[var(--color-text-secondary)] mt-3 shrink-0"
            />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="typo-caption font-semibold text-accent">
                  Q{qIndex + 1}
                </span>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(qIndex, { question: e.target.value })
                  }
                  placeholder="Enter question..."
                  className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 typo-body outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-500 hover:bg-red-500/10 rounded-full p-1.5"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="space-y-2 pl-6">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctIndex === oIndex}
                      onChange={() =>
                        updateQuestion(qIndex, { correctIndex: oIndex })
                      }
                      className="accent-green-600"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) =>
                        updateOption(qIndex, oIndex, e.target.value)
                      }
                      placeholder={`Option ${oIndex + 1}`}
                      className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 typo-caption outline-none"
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-[var(--color-text-secondary)] hover:text-red-500 p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="typo-caption text-accent hover:underline"
                >
                  + Add option
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={q.explanation || ""}
                  onChange={(e) =>
                    updateQuestion(qIndex, { explanation: e.target.value })
                  }
                  placeholder="Explanation (optional)"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 typo-caption outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="w-full py-3 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-accent/50 text-[var(--color-text-secondary)] hover:text-accent typo-body transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Add Question
      </button>
    </div>
  );
}
