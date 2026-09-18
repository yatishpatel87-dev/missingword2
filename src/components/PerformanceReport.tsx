import React from 'react';
import { Award, CheckCircle2, XCircle, Clock, Flame, RotateCcw, FileText, Sparkles, Trophy } from 'lucide-react';
import { StudentSession } from '../types';

interface PerformanceReportProps {
  session: StudentSession;
  onViewCertificate: () => void;
  onReplayCelebration: () => void;
  onPlayAgain: () => void;
}

export const PerformanceReport: React.FC<PerformanceReportProps> = ({
  session,
  onViewCertificate,
  onReplayCelebration,
  onPlayAgain,
}) => {
  const accuracy = Math.round((session.correctCount / session.totalChallenges) * 100);

  const badgeDetails = {
    gold: {
      medal: '🥇',
      title: 'Gold Master Detective',
      gujarati: 'સુવર્ણ માસ્ટર ડિટેક્ટિવ (Gold Master)',
      desc: 'Outstanding mastery! You solved nearly every puzzle!',
      color: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    silver: {
      medal: '🥈',
      title: 'Silver Senior Detective',
      gujarati: 'રજત સિનિયર ડિટેક્ટિવ (Silver Detective)',
      desc: 'Great deductive skills! Strong vocabulary!',
      color: 'bg-slate-100 text-slate-800 border-slate-300',
    },
    bronze: {
      medal: '🥉',
      title: 'Bronze Junior Detective',
      gujarati: 'કાંસ્ય જુનિયર ડિટેક્ટિવ (Bronze Detective)',
      desc: 'Good effort! Keep practicing to reach Gold rank!',
      color: 'bg-orange-100 text-amber-900 border-orange-300',
    },
    cadet: {
      medal: '🎖️',
      title: 'Detective Cadet',
      gujarati: 'તાલીમાર્થી ડિટેક્ટિવ (Cadet)',
      desc: 'A promising start! Try again to upgrade your rank!',
      color: 'bg-sky-100 text-sky-900 border-sky-300',
    },
  }[session.badgeTier];

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-3 sm:px-6 animate-fadeIn">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl border border-amber-200 shadow-xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 p-6 sm:p-8 text-white text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs sm:text-sm font-semibold mb-2">
            <Trophy className="w-4 h-4 text-amber-200" />
            <span>Mission Completed / મિશન પૂર્ણ થયું!</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-fun tracking-wide mb-1">
            Performance Report
          </h1>
          <p className="text-amber-100 text-sm sm:text-base font-gujarati">
            વિદ્યાર્થી પ્રગતિ અહેવાલ: <strong>{session.studentName}</strong> (Level {session.level})
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onViewCertificate}
              id="view-cert-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold hover:bg-amber-50 shadow-md transition-all hover:scale-105"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>View & Print Certificate 📜</span>
            </button>

            <button
              onClick={onReplayCelebration}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700/80 hover:bg-amber-700 text-white font-bold border border-white/20 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Replay Crackers 🎆</span>
            </button>

            <button
              onClick={onPlayAgain}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again 🎮</span>
            </button>
          </div>
        </div>

        {/* Highlight Score & Badge Banner */}
        <div className="p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-100 text-center">
          <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Final Score
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono">
              {session.totalScore.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">points</div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Accuracy
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
              {accuracy}%
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              {session.correctCount} of {session.totalChallenges} correct
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Max Combo Streak
            </div>
            <div className="text-2xl sm:text-3xl font-black text-orange-800 font-mono flex items-center justify-center gap-1">
              <Flame className="w-6 h-6 text-orange-600 fill-orange-500" />
              <span>{session.highestStreak}x</span>
            </div>
            <div className="text-[11px] text-orange-700 mt-0.5">in a row</div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Time Spent
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 font-mono flex items-center justify-center gap-1">
              <Clock className="w-5 h-5 text-slate-500" />
              <span>{Math.floor(session.totalTimeSeconds / 60)}m {session.totalTimeSeconds % 60}s</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">total detective time</div>
          </div>
        </div>

        {/* Achievement Badge Details */}
        <div className="p-6 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-5xl">{badgeDetails.medal}</div>
          <div className="text-center sm:text-left flex-1">
            <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider mb-1">
              {session.badgeTier} Achievement
            </div>
            <h3 className="text-lg font-black text-slate-900">{badgeDetails.title}</h3>
            <p className="text-xs text-amber-900 font-gujarati">{badgeDetails.gujarati}</p>
            <p className="text-xs text-slate-600 mt-1">{badgeDetails.desc}</p>
          </div>
        </div>
      </div>

      {/* Detailed Question Review List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Question-by-Question Review</h2>
            <p className="text-xs text-slate-500 font-gujarati">
              બધા ૨૦ પ્રશ્નો અને તમારા જવાબોની સમીક્ષા
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> {session.correctCount} Correct
            </span>
            <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
              <XCircle className="w-3.5 h-3.5" /> {session.wrongCount} Incorrect
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {session.results.map((res, index) => {
            const cleanSentence = res.question.replace('____', res.missingWord);
            return (
              <div
                key={res.questionId || index}
                className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  res.isCorrect
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                    : 'bg-rose-50/40 border-rose-200 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {res.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        Q{index + 1}.
                      </span>
                      <span className="font-semibold text-slate-900 text-sm sm:text-base">
                        {res.question.split('____')[0]}
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold underline ${
                            res.isCorrect
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {res.missingWord}
                        </span>
                        {res.question.split('____')[1]}
                      </span>
                    </div>

                    {!res.isCorrect && (
                      <div className="text-xs mt-1 text-slate-600">
                        <span>Your answer: </span>
                        <span className="font-bold text-rose-700 line-through">
                          "{res.userAnswer || '(no answer)'}"
                        </span>
                        <span className="ml-2">| Correct answer: </span>
                        <span className="font-bold text-emerald-700">"{res.missingWord}"</span>
                      </div>
                    )}

                    <div className="text-xs text-slate-500 font-gujarati mt-0.5">
                      {res.gujaratiTranslation}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 text-xs flex-shrink-0">
                  <span className="text-slate-500 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {res.timeTaken}s
                  </span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded ${
                      res.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    +{res.pointsEarned} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
