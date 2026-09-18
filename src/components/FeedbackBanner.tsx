import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Flame, Zap, HeartCrack } from 'lucide-react';
import { Question } from '../types';

interface FeedbackBannerProps {
  isCorrect: boolean;
  question: Question;
  userAnswer: string;
  pointsEarned: number;
  streakCount: number;
  multiplier: number;
  speedBonus: number;
  isTimeOut: boolean;
  onNext: () => void;
  isLastChallenge: boolean;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  isCorrect,
  question,
  userAnswer,
  pointsEarned,
  streakCount,
  multiplier,
  speedBonus,
  isTimeOut,
  onNext,
  isLastChallenge,
}) => {
  // Listen to Enter or Space key to advance to next challenge
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext]);

  // Construct complete sentence with highlight
  const cleanWord = question.missingWord;
  const sentenceWithAnswer = question.sentence.replace('____', cleanWord);

  return (
    <div
      className={`w-full rounded-2xl border-2 p-4 sm:p-6 shadow-xl transition-all animate-scaleIn ${
        isCorrect
          ? 'bg-emerald-50/95 border-emerald-400 text-emerald-950'
          : 'bg-rose-50/95 border-rose-400 text-rose-950'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Status & Sentence */}
        <div className="flex items-start gap-3.5">
          <div className="flex-shrink-0 mt-0.5">
            {isCorrect ? (
              <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-md">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-rose-500 text-white shadow-md">
                <XCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-lg sm:text-xl font-black tracking-tight ${
                  isCorrect ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                {isCorrect
                  ? '🟢 Correct Answer! સાચો જવાબ!'
                  : isTimeOut
                  ? '🔴 Time Up! સમય પૂરો થયો!'
                  : '🔴 Incorrect Answer! ખોટો જવાબ!'}
              </span>

              {!isCorrect && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-200 text-rose-800">
                  <HeartCrack className="w-3.5 h-3.5" /> -1 Life
                </span>
              )}

              {isCorrect && streakCount > 1 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-300 animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  {streakCount}x Streak!
                </span>
              )}
            </div>

            {/* Complete sentence display */}
            <div className="mt-2 text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
              <span>Complete Sentence: </span>
              <span className="font-serif italic font-bold">
                "{question.sentence.split('____')[0]}
                <span
                  className={`px-2 py-0.5 rounded-md font-bold underline ${
                    isCorrect
                      ? 'bg-emerald-200/90 text-emerald-900 font-sans'
                      : 'bg-rose-200/90 text-rose-900 font-sans'
                  }`}
                >
                  {cleanWord}
                </span>
                {question.sentence.split('____')[1]}"
              </span>
            </div>

            {/* Answer Comparison if wrong */}
            {!isCorrect && (
              <div className="mt-1 text-sm text-slate-600">
                <span>You wrote: </span>
                <span className="font-semibold text-rose-700 line-through">
                  "{userAnswer || '(nothing)'}"
                </span>
                <span className="ml-2">| Correct word: </span>
                <span className="font-bold text-emerald-700">"{cleanWord}"</span>
              </div>
            )}

            {/* Gujarati meaning */}
            <div className="mt-1.5 text-sm text-slate-600 font-gujarati flex items-center gap-1">
              <span className="text-amber-700 font-semibold">અર્થ:</span>
              <span>{question.gujaratiTranslation}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Points breakdown & Next Button */}
        <div className="flex flex-col sm:flex-row md:flex-col items-end md:items-end justify-between gap-3 border-t md:border-t-0 border-slate-200/60 pt-3 md:pt-0">
          {isCorrect ? (
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                +{pointsEarned} <span className="text-sm font-normal text-emerald-600">pts</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 justify-end">
                <span>Base: 100</span>
                {speedBonus > 0 && (
                  <span className="text-amber-700 font-semibold flex items-center">
                    <Zap className="w-3 h-3 mr-0.5" /> +{speedBonus} speed
                  </span>
                )}
                {multiplier > 1 && (
                  <span className="text-amber-800 font-semibold">
                    x{multiplier.toFixed(1)} streak
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-right">
              <div className="text-xl font-bold text-rose-600 font-mono">0 pts</div>
              <div className="text-xs text-slate-500">Streak reset to 0</div>
            </div>
          )}

          <button
            onClick={onNext}
            id="next-challenge-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <span>{isLastChallenge ? 'Finish & Celebrate! 🎆' : 'Next Challenge'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
