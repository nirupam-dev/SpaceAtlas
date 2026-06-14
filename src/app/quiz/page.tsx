"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { SectionHeading } from "@/components/ui/Cards";
import { quizzes } from "@/lib/data";
import { useState } from "react";

export default function QuizPage() {
  const [selectedQuiz, setSelectedQuiz] = useState<typeof quizzes[0] | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const startQuiz = (quiz: typeof quizzes[0]) => {
    setSelectedQuiz(quiz);
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setFinished(false);
  };

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === selectedQuiz!.questions[currentQ].correctAnswer) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= selectedQuiz!.questions.length) {
      setFinished(true);
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  if (!selectedQuiz) {
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <SectionHeading badge="Challenge" title="Space Quiz" subtitle="Test your cosmic knowledge" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((quiz, i) => (
              <motion.button key={quiz.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} onClick={() => startQuiz(quiz)} className="glass-card glass-card-hover p-8 text-left group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 mb-4 flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white group-hover:text-accent-blue transition-colors mb-2">{quiz.title}</h3>
                <div className="flex items-center gap-4 text-sm text-space-400">
                  <span>{quiz.questions.length} questions</span>
                  <span className="badge badge-active">{quiz.difficulty}</span>
                  <span>{quiz.category}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round((score / selectedQuiz.questions.length) * 100);
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center">
            <Trophy className="w-16 h-16 text-accent-amber mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
            <p className="text-space-400 mb-6">{selectedQuiz.title}</p>
            <div className="text-6xl font-bold gradient-text mb-2">{percentage}%</div>
            <p className="text-space-400 mb-8">{score} out of {selectedQuiz.questions.length} correct</p>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => startQuiz(selectedQuiz)} className="btn-primary flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button onClick={() => setSelectedQuiz(null)} className="btn-outline">All Quizzes</button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const question = selectedQuiz.questions[currentQ];

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-space-400 mb-2">
            <span>{selectedQuiz.title}</span>
            <span>{currentQ + 1} / {selectedQuiz.questions.length}</span>
          </div>
          <div className="w-full h-2 bg-space-800 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full" animate={{ width: `${((currentQ + 1) / selectedQuiz.questions.length) * 100}%` }} />
          </div>
        </div>

        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
          <h3 className="text-xl font-semibold text-white mb-6">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              let borderClass = "border-space-700 hover:border-accent-blue/50";
              if (showResult) {
                if (idx === question.correctAnswer) borderClass = "border-green-500 bg-green-500/10";
                else if (idx === selected) borderClass = "border-red-500 bg-red-500/10";
              } else if (idx === selected) {
                borderClass = "border-accent-blue";
              }
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${borderClass}`}>
                  <span className="text-white">{opt}</span>
                  {showResult && idx === question.correctAnswer && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {showResult && idx === selected && idx !== question.correctAnswer && <XCircle className="w-5 h-5 text-red-500" />}
                </button>
              );
            })}
          </div>

          {showResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <div className="p-4 rounded-xl bg-space-800 border border-space-700 mb-4">
                <p className="text-sm text-space-300">{question.explanation}</p>
              </div>
              <button onClick={nextQuestion} className="btn-primary flex items-center gap-2 ml-auto">
                {currentQ + 1 >= selectedQuiz.questions.length ? "See Results" : "Next Question"} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
