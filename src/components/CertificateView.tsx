import React from 'react';
import { Award, Printer, ArrowLeft, RotateCcw, Share2, CheckCircle, ShieldCheck } from 'lucide-react';
import { StudentSession } from '../types';

interface CertificateViewProps {
  session: StudentSession;
  onBackToReport: () => void;
  onPlayAgain: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  session,
  onBackToReport,
  onPlayAgain,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = `🕵️‍♂️ ${session.studentName} earned ${session.badgeTier.toUpperCase()} Detective Badge with a score of ${session.totalScore} in Missing Word Detective!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Missing Word Detective Certificate',
          text,
          url: window.location.href,
        });
      } catch {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Certificate details copied to clipboard!');
    }
  };

  const formattedDate = new Date(session.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const accuracy = Math.round((session.correctCount / session.totalChallenges) * 100);

  // Badge tier info
  const badgeConfig = {
    gold: {
      title: 'Gold Master Detective',
      gujaratiTitle: 'સુવર્ણ માસ્ટર ડિટેક્ટિવ',
      color: 'from-amber-400 via-yellow-200 to-amber-500',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-400',
      bgColor: 'bg-amber-50',
      medal: '🥇',
      ribbon: 'bg-amber-500',
    },
    silver: {
      title: 'Silver Senior Detective',
      gujaratiTitle: 'રજત સિનિયર ડિટેક્ટિવ',
      color: 'from-slate-300 via-slate-100 to-slate-400',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-400',
      bgColor: 'bg-slate-50',
      medal: '🥈',
      ribbon: 'bg-slate-500',
    },
    bronze: {
      title: 'Bronze Junior Detective',
      gujaratiTitle: 'કાંસ્ય જુનિયર ડિટેક્ટિવ',
      color: 'from-amber-700 via-amber-200 to-amber-800',
      textColor: 'text-amber-900',
      borderColor: 'border-amber-600',
      bgColor: 'bg-orange-50/70',
      medal: '🥉',
      ribbon: 'bg-amber-700',
    },
    cadet: {
      title: 'Detective In Training',
      gujaratiTitle: 'તાલીમાર્થી ડિટેક્ટિવ',
      color: 'from-blue-400 via-sky-200 to-blue-500',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-400',
      bgColor: 'bg-sky-50',
      medal: '🎖️',
      ribbon: 'bg-blue-500',
    },
  }[session.badgeTier];

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-2 sm:px-4">
      {/* Action Header - hidden in print */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
        <button
          onClick={onBackToReport}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-amber-700 py-2 px-3 rounded-lg hover:bg-amber-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Performance Report</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-amber-700 py-2 px-3 rounded-lg border border-slate-200 hover:border-amber-300 bg-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={handlePrint}
            id="print-certificate-btn"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 py-2 px-4 rounded-lg shadow-sm transition-all hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 py-2 px-3 rounded-lg shadow-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Canvas / Card */}
      <div className="certificate-print-container bg-amber-50/70 border-8 border-double border-amber-600 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden text-center select-text">
        {/* Decorative corner flourishes */}
        <div className="absolute top-3 left-3 w-12 h-12 border-t-4 border-l-4 border-amber-700 pointer-events-none" />
        <div className="absolute top-3 right-3 w-12 h-12 border-t-4 border-r-4 border-amber-700 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-12 h-12 border-b-4 border-l-4 border-amber-700 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-12 h-12 border-b-4 border-r-4 border-amber-700 pointer-events-none" />

        {/* Certificate Header */}
        <div className="mb-4">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-100 border border-amber-300 shadow-inner mb-2">
            <Award className="w-10 h-10 text-amber-700" />
          </div>
          <p className="text-xs sm:text-sm font-bold tracking-widest text-amber-800 uppercase">
            Official Academy of Word Detectives
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif mt-1">
            Certificate of Achievement
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-gujarati mt-0.5">
            શબ્દ ડિટેક્ટિવ સિદ્ધિ પ્રમાણપત્ર
          </p>
        </div>

        {/* Presentation Text */}
        <div className="my-6 max-w-2xl mx-auto">
          <p className="text-sm sm:text-base text-slate-600 italic">
            This certifies that word detective scholar
          </p>

          <div className="my-3 py-2 border-b-2 border-amber-400 inline-block px-8 sm:px-16 min-w-[280px]">
            <span className="text-2xl sm:text-4xl font-black text-amber-950 font-serif tracking-wide capitalize">
              {session.studentName}
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-700 mt-2 leading-relaxed">
            has successfully solved <strong>20 Missing Word Challenges</strong> in{' '}
            <span className="font-bold text-amber-800">Level {session.level}</span> with outstanding
            linguistic deduction and detective prowess.
          </p>
        </div>

        {/* Achievement Badge & Score Summary */}
        <div className="my-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          {/* Achievement Seal / Medal */}
          <div className="flex flex-col items-center">
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 ${badgeConfig.borderColor} bg-gradient-to-tr ${badgeConfig.color} flex flex-col items-center justify-center shadow-lg relative`}
            >
              <span className="text-3xl sm:text-4xl">{badgeConfig.medal}</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 font-sans mt-0.5">
                {session.badgeTier}
              </span>
            </div>
            <span className="text-sm sm:text-base font-black text-slate-800 mt-2">
              {badgeConfig.title}
            </span>
            <span className="text-xs text-slate-600 font-gujarati">
              {badgeConfig.gujaratiTitle}
            </span>
          </div>

          {/* Stats Box */}
          <div className="bg-white/80 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs text-left min-w-[200px]">
            <div className="flex items-center justify-between gap-4 py-1 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Final Score:</span>
              <span className="text-base font-extrabold text-amber-800 font-mono">
                {session.totalScore.toLocaleString()} pts
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 py-1 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Accuracy:</span>
              <span className="text-base font-bold text-emerald-700">
                {accuracy}% ({session.correctCount}/20)
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 py-1 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Max Streak:</span>
              <span className="text-base font-bold text-amber-600">
                {session.highestStreak} in a row
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 py-1">
              <span className="text-xs text-slate-500 font-medium">Detective Level:</span>
              <span className="text-base font-bold text-slate-800">Level {session.level}</span>
            </div>
          </div>
        </div>

        {/* Footer with Signatures and Seal */}
        <div className="mt-10 pt-6 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
          <div className="text-center sm:text-left">
            <div className="text-sm font-semibold text-slate-800 font-serif">
              {formattedDate}
            </div>
            <div className="text-xs text-slate-500">Date Awarded / તારીખ</div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ID: {session.id.slice(0, 12)}</span>
          </div>

          <div className="text-center sm:text-right">
            <div className="font-serif italic font-bold text-amber-900 border-b border-slate-400 pb-1 px-4 inline-block">
              Chief Inspector Word Detective
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Authorised Signature / સહી</div>
          </div>
        </div>
      </div>
    </div>
  );
};
