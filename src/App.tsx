import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Heart,
  HeartCrack,
  Flame,
  Clock,
  Volume2,
  VolumeX,
  Trophy,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  User,
  ShieldCheck,
  Search,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Question, GameLevel, StudentSession, ChallengeResult, BadgeTier, StreakState } from './types';
import { getRandomChallenges, saveStudentSession } from './utils/storage';
import { sound } from './utils/sound';
import { WritingBox } from './components/WritingBox';
import { FeedbackBanner } from './components/FeedbackBanner';
import { FirecrackersCelebration } from './components/FirecrackersCelebration';
import { PerformanceReport } from './components/PerformanceReport';
import { CertificateView } from './components/CertificateView';
import { TeacherDashboard } from './components/TeacherDashboard';

type AppView = 'welcome' | 'playing' | 'celebration' | 'report' | 'certificate' | 'gameover' | 'teacher';

export default function App() {
  // Navigation & session state
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('detective_student_name') || '';
  });
  const [selectedLevel, setSelectedLevel] = useState<GameLevel>(1);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getIsMuted());

  // Active game state
  const [challenges, setChallenges] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<StreakState>({ count: 0, multiplier: 1, highest: 0 });
  const [results, setResults] = useState<ChallengeResult[]>([]);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);

  // Per-question timer
  const [timeLeft, setTimeLeft] = useState<number>(35);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isAnsweringLocked, setIsAnsweringLocked] = useState<boolean>(false);
  const [latestFeedback, setLatestFeedback] = useState<{
    isCorrect: boolean;
    userAnswer: string;
    pointsEarned: number;
    speedBonus: number;
    isTimeOut: boolean;
  } | null>(null);

  // Heart shake animation
  const [heartShake, setHeartShake] = useState<boolean>(false);

  // Active finished session for report & certificate
  const [completedSession, setCompletedSession] = useState<StudentSession | null>(null);

  // Time allocated per question per level
  const LEVEL_TIMERS: Record<GameLevel, number> = {
    1: 40,
    2: 28,
    3: 18,
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Start new 20 challenges session
  const startNewGame = (level: GameLevel) => {
    const name = studentName.trim() || 'Young Detective';
    setStudentName(name);
    try {
      localStorage.setItem('detective_student_name', name);
    } catch {
      // ignore
    }

    const qs = getRandomChallenges(level, 20);
    setChallenges(qs);
    setSelectedLevel(level);
    setCurrentIndex(0);
    setLives(3);
    setScore(0);
    setStreak({ count: 0, multiplier: 1, highest: 0 });
    setResults([]);
    setTotalTimeSpent(0);
    setLatestFeedback(null);
    setIsAnsweringLocked(false);

    const initialTime = LEVEL_TIMERS[level];
    setTimeLeft(initialTime);
    setQuestionStartTime(Date.now());
    setCurrentView('playing');
  };

  // Answer submission handler
  const handleAnswerSubmit = useCallback(
    (inputAnswer: string, isTimeOut: boolean = false) => {
      if (isAnsweringLocked) return;
      setIsAnsweringLocked(true);

      const currentQ = challenges[currentIndex];
      if (!currentQ) return;

      const elapsed = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
      setTotalTimeSpent(prev => prev + elapsed);

      const targetWord = currentQ.missingWord.trim().toLowerCase();
      const userClean = inputAnswer.trim().toLowerCase();
      const altClean = (currentQ.alternatives || []).map(a => a.trim().toLowerCase());

      const isCorrect = !isTimeOut && (userClean === targetWord || altClean.includes(userClean));

      let earnedPoints = 0;
      let speedBonus = 0;
      let newMultiplier = 1;
      let newStreakCount = 0;

      if (isCorrect) {
        sound.playCorrect();
        newStreakCount = streak.count + 1;
        // Multiplier progression: 1x -> 1.2x -> 1.4x -> 1.6x -> 2.0x (max 3.0x)
        newMultiplier = Math.min(3.0, 1 + (newStreakCount - 1) * 0.2);

        // Base score = 100
        const baseScore = 100;
        // Speed bonus: up to +50 points if answered fast
        const maxLevelTime = LEVEL_TIMERS[selectedLevel];
        const timeRatio = Math.max(0, timeLeft / maxLevelTime);
        speedBonus = Math.round(timeRatio * 50);

        earnedPoints = Math.round((baseScore + speedBonus) * newMultiplier);
        setScore(prev => prev + earnedPoints);

        const newHighest = Math.max(streak.highest, newStreakCount);
        setStreak({
          count: newStreakCount,
          multiplier: newMultiplier,
          highest: newHighest,
        });

        if (newStreakCount >= 3) {
          sound.playStreak();
        }
      } else {
        sound.playWrong();
        sound.playHeartLoss();
        setHeartShake(true);
        setTimeout(() => setHeartShake(false), 800);

        setLives(prev => Math.max(0, prev - 1));
        setStreak(prev => ({
          count: 0,
          multiplier: 1,
          highest: prev.highest,
        }));
      }

      const challengeResult: ChallengeResult = {
        questionId: currentQ.id,
        question: currentQ.sentence,
        missingWord: currentQ.missingWord,
        userAnswer: inputAnswer,
        isCorrect,
        timeTaken: elapsed,
        pointsEarned: earnedPoints,
        gujaratiTranslation: currentQ.gujaratiTranslation,
      };

      setResults(prev => [...prev, challengeResult]);

      setLatestFeedback({
        isCorrect,
        userAnswer: inputAnswer,
        pointsEarned: earnedPoints,
        speedBonus,
        isTimeOut,
      });
    },
    [isAnsweringLocked, challenges, currentIndex, questionStartTime, streak, selectedLevel, timeLeft]
  );

  // Timer countdown loop during playing
  useEffect(() => {
    if (currentView !== 'playing' || isAnsweringLocked) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAnswerSubmit('', true); // Time out
          return 0;
        }
        if (prev <= 5) {
          sound.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentView, isAnsweringLocked, handleAnswerSubmit]);

  // Complete game session helper
  const finalizeGameSession = (finalResults: ChallengeResult[], finalScore: number) => {
    const correctCount = finalResults.filter(r => r.isCorrect).length;
    const wrongCount = finalResults.length - correctCount;
    const accuracy = Math.round((correctCount / finalResults.length) * 100);

    let badgeTier: BadgeTier = 'cadet';
    if (accuracy >= 90) badgeTier = 'gold';
    else if (accuracy >= 75) badgeTier = 'silver';
    else if (accuracy >= 60) badgeTier = 'bronze';

    const session: StudentSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      studentName: studentName.trim() || 'Young Detective',
      timestamp: Date.now(),
      level: selectedLevel,
      totalScore: finalScore,
      totalChallenges: 20,
      correctCount,
      wrongCount,
      livesRemaining: lives,
      highestStreak: streak.highest,
      totalTimeSeconds: totalTimeSpent,
      badgeTier,
      results: finalResults,
    };

    saveStudentSession(session);
    setCompletedSession(session);

    // If all 20 challenges finished successfully, launch the 10-second fireworks celebration!
    setCurrentView('celebration');
  };

  // Next Challenge handler
  const handleNextChallenge = () => {
    // Check if lives reached 0
    if (lives <= 0) {
      const correctCount = results.filter(r => r.isCorrect).length;
      const accuracy = Math.round((correctCount / Math.max(1, results.length)) * 100);
      let badgeTier: BadgeTier = 'cadet';
      if (accuracy >= 75) badgeTier = 'silver';
      else if (accuracy >= 50) badgeTier = 'bronze';

      const session: StudentSession = {
        id: `session-${Date.now()}`,
        studentName: studentName.trim() || 'Young Detective',
        timestamp: Date.now(),
        level: selectedLevel,
        totalScore: score,
        totalChallenges: 20,
        correctCount,
        wrongCount: results.length - correctCount,
        livesRemaining: 0,
        highestStreak: streak.highest,
        totalTimeSeconds: totalTimeSpent,
        badgeTier,
        results,
      };
      setCompletedSession(session);
      setCurrentView('gameover');
      return;
    }

    // Check if finished all 20 challenges
    if (currentIndex + 1 >= challenges.length || currentIndex + 1 >= 20) {
      finalizeGameSession(results, score);
      return;
    }

    // Advance to next challenge
    setCurrentIndex(prev => prev + 1);
    setLatestFeedback(null);
    setIsAnsweringLocked(false);
    const nextTime = LEVEL_TIMERS[selectedLevel];
    setTimeLeft(nextTime);
    setQuestionStartTime(Date.now());
  };

  // Current active challenge
  const currentQuestion = challenges[currentIndex];
  const maxTimeForCurrentLevel = LEVEL_TIMERS[selectedLevel] || 30;
  const timerPercentage = Math.max(0, Math.min(100, (timeLeft / maxTimeForCurrentLevel) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-orange-50/30 to-amber-100/40 text-slate-800 flex flex-col justify-between">
      {/* ============================================================== */}
      {/* 1. TOP GLOBAL APP HEADER */}
      {/* ============================================================== */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-amber-200/80 sticky top-0 z-30 shadow-xs px-3 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div
            onClick={() => {
              if (currentView === 'playing') {
                if (confirm('Leave the current detective challenge? Progress will be lost.')) {
                  setCurrentView('welcome');
                }
              } else {
                setCurrentView('welcome');
              }
            }}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-fun font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                  Missing Word Detective
                </span>
                <span className="hidden sm:inline text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  શબ્દ ડિટેક્ટિવ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-gujarati hidden sm:block">
                વાક્યમાં ખૂટતો યોગ્ય word શોધીને લખો!
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Name Indicator if playing */}
            {studentName && currentView === 'playing' && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Detective {studentName}</span>
              </div>
            )}

            {/* Sound Mute Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 transition-colors border border-slate-200"
              title={isMuted ? 'Unmute game sounds' : 'Mute sounds'}
              aria-label="Sound Toggle"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* Teacher Mode Button */}
            <button
              onClick={() => setCurrentView('teacher')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                currentView === 'teacher'
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                  : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-300'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Teacher Mode</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN APPLICATION CONTENT */}
      {/* ============================================================== */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-6 flex flex-col justify-center">
        {/* VIEW 1: WELCOME SCREEN (Student Name, Level 1/2/3 selection, Rules) */}
        {currentView === 'welcome' && (
          <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border-2 border-amber-200 shadow-xl p-6 sm:p-10 my-4 text-center animate-fadeIn">
            {/* Detective Mascot Emblem */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-500 text-white shadow-lg mb-4 transform -rotate-3 hover:rotate-0 transition-transform">
              <Search className="w-10 h-10 text-white stroke-[2.5]" />
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-fun text-slate-900 tracking-tight mb-1">
              Missing Word Detective
            </h1>
            <p className="text-sm sm:text-base text-amber-800 font-gujarati font-semibold mb-6">
              વાક્યમાં ખૂટતો યોગ્ય word શોધો અને સાચો સ્પેલિંગ લખો!
            </p>

            {/* Student Name Input */}
            <div className="text-left mb-6 max-w-md mx-auto">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                👦 Student Name / વિદ્યાર્થીનું નામ *
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="student-name-input"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Enter student name (દા.ત. Aarav / Diya)..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 text-base font-bold text-slate-800 outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Difficulty Level Selection */}
            <div className="text-left mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                🎯 Select Detective Level / સ્તર પસંદ કરો
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Level 1 */}
                <button
                  type="button"
                  onClick={() => setSelectedLevel(1)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    selectedLevel === 1
                      ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400/40'
                      : 'border-slate-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-amber-900 text-base">Level 1</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Easy
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">Everyday words & animals</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" /> 40s per question
                  </div>
                </button>

                {/* Level 2 */}
                <button
                  type="button"
                  onClick={() => setSelectedLevel(2)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    selectedLevel === 2
                      ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400/40'
                      : 'border-slate-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-amber-900 text-base">Level 2</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                      Medium
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">Grammar & context clues</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" /> 28s per question
                  </div>
                </button>

                {/* Level 3 */}
                <button
                  type="button"
                  onClick={() => setSelectedLevel(3)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    selectedLevel === 3
                      ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400/40'
                      : 'border-slate-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-amber-900 text-base">Level 3</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                      Master
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">Idioms & deduction</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" /> 18s per question
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Game Rules Checklist */}
            <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-4 mb-6 text-left text-xs sm:text-sm text-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <span className="font-semibold">20 Challenges</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">❤️</span>
                <span className="font-semibold">3 Lives</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <span className="font-semibold">Streak Combos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🎆</span>
                <span className="font-semibold">10s Crackers!</span>
              </div>
            </div>

            {/* Start Detective Game Button */}
            <button
              onClick={() => startNewGame(selectedLevel)}
              id="start-detective-game-btn"
              className="w-full max-w-md mx-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg sm:text-xl shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-6 h-6 text-amber-200" />
              <span>Start Investigation (૨૦ પડકારો)</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* VIEW 2: ACTIVE CHALLENGE SCREEN */}
        {currentView === 'playing' && currentQuestion && (
          <div className="w-full max-w-3xl mx-auto space-y-4 animate-fadeIn">
            {/* Live Dashboard Bar: Challenge Progress, Lives, Score, Timer */}
            <div className="bg-white rounded-2xl border border-amber-200 p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
              {/* Challenge Counter & Level */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                  Challenge {currentIndex + 1} / 20
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Level {selectedLevel}
                </span>
              </div>

              {/* 3 Lives Display with Heartbreak Animation */}
              <div className={`flex items-center gap-1.5 ${heartShake ? 'animate-shake' : ''}`}>
                <span className="text-xs font-bold text-slate-500 uppercase mr-1">Lives:</span>
                {[1, 2, 3].map(heartNum => (
                  <span key={heartNum} className="transition-transform duration-300">
                    {heartNum <= lives ? (
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 fill-rose-500 filter drop-shadow-xs" />
                    ) : (
                      <HeartCrack className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 stroke-slate-400" />
                    )}
                  </span>
                ))}
              </div>

              {/* Streak Flame & Multiplier */}
              {streak.count > 1 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-300 text-xs font-black animate-pulse">
                  <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
                  <span>{streak.count} Combo ({streak.multiplier.toFixed(1)}x)</span>
                </div>
              )}

              {/* Total Live Score */}
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-500">Score:</span>
                <span className="text-lg sm:text-xl font-black text-amber-700 font-mono">
                  {score.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Timer Bar */}
            <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden shadow-inner border border-slate-200 relative">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 5
                    ? 'bg-rose-500 animate-pulse'
                    : timeLeft <= 10
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${timerPercentage}%` }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-700 font-mono">
                ⏱️ {timeLeft}s
              </span>
            </div>

            {/* Main Question / Sentence Card */}
            <div className="bg-white rounded-3xl border-2 border-amber-300/80 shadow-xl p-6 sm:p-8 text-center relative overflow-hidden">
              {/* Category Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-4 uppercase tracking-wider">
                <span>🔍 Category: {currentQuestion.category}</span>
              </div>

              {/* English Sentence with Mystery Blank */}
              <div className="my-2">
                <p className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-relaxed font-serif">
                  {currentQuestion.sentence.split('____')[0]}
                  <span className="inline-flex items-center justify-center px-4 py-1 mx-1.5 rounded-xl border-2 border-dashed border-amber-500 bg-amber-50/90 text-amber-800 font-mono tracking-widest min-w-[90px] shadow-xs">
                    ? ? ? ?
                  </span>
                  {currentQuestion.sentence.split('____')[1]}
                </p>
              </div>

              {/* Gujarati Meaning for Context */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-600 text-sm sm:text-base font-gujarati">
                <span className="text-amber-700 font-bold">અર્થ:</span>
                <span className="font-semibold text-slate-800">
                  {currentQuestion.gujaratiTranslation}
                </span>
              </div>
            </div>

            {/* Interactive Writing Box or Feedback Banner */}
            {!latestFeedback ? (
              <WritingBox
                missingWord={currentQuestion.missingWord}
                englishHint={currentQuestion.englishHint}
                gujaratiHint={currentQuestion.gujaratiHint}
                onSubmit={handleAnswerSubmit}
                isDisabled={isAnsweringLocked}
              />
            ) : (
              <FeedbackBanner
                isCorrect={latestFeedback.isCorrect}
                question={currentQuestion}
                userAnswer={latestFeedback.userAnswer}
                pointsEarned={latestFeedback.pointsEarned}
                streakCount={streak.count}
                multiplier={streak.multiplier}
                speedBonus={latestFeedback.speedBonus}
                isTimeOut={latestFeedback.isTimeOut}
                onNext={handleNextChallenge}
                isLastChallenge={currentIndex + 1 >= 20}
              />
            )}
          </div>
        )}

        {/* VIEW 3: 10-SECOND CELEBRATION WITH CRACKERS */}
        {currentView === 'celebration' && completedSession && (
          <FirecrackersCelebration
            studentName={completedSession.studentName}
            totalScore={completedSession.totalScore}
            onComplete={() => setCurrentView('report')}
          />
        )}

        {/* VIEW 4: PERFORMANCE & PROGRESS REPORT */}
        {currentView === 'report' && completedSession && (
          <PerformanceReport
            session={completedSession}
            onViewCertificate={() => setCurrentView('certificate')}
            onReplayCelebration={() => setCurrentView('celebration')}
            onPlayAgain={() => startNewGame(selectedLevel)}
          />
        )}

        {/* VIEW 5: OFFICIAL PRINTABLE CERTIFICATE */}
        {currentView === 'certificate' && completedSession && (
          <CertificateView
            session={completedSession}
            onBackToReport={() => setCurrentView('report')}
            onPlayAgain={() => startNewGame(selectedLevel)}
          />
        )}

        {/* VIEW 6: GAME OVER (Lost 3 lives) */}
        {currentView === 'gameover' && completedSession && (
          <div className="w-full max-w-md mx-auto bg-white rounded-3xl border-2 border-rose-300 shadow-2xl p-6 sm:p-8 text-center animate-scaleIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 mb-4">
              <HeartCrack className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-fun mb-1">
              Case Paused!
            </h2>
            <p className="text-sm text-slate-600 font-gujarati mb-4">
              બધા ૩ જીવ વપરાઈ ગયા! પરંતુ તમે ઘણું સારું રમ્યા.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
              <div className="text-xs text-slate-500 uppercase font-semibold">Points Earned</div>
              <div className="text-3xl font-black text-amber-700 font-mono">
                {score.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Completed {results.length} of 20 challenges
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => startNewGame(selectedLevel)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again with 3 Lives ❤️</span>
              </button>

              <button
                onClick={() => setCurrentView('report')}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
              >
                <span>View Performance Report</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 7: TEACHER MODE */}
        {currentView === 'teacher' && (
          <TeacherDashboard onBackToGame={() => setCurrentView('welcome')} />
        )}
      </main>

      {/* ============================================================== */}
      {/* 3. FOOTER */}
      {/* ============================================================== */}
      <footer className="no-print w-full py-4 text-center text-xs text-slate-500 border-t border-amber-200/50 bg-amber-50/40">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-gujarati">
            Missing Word Detective — વાક્યમાં ખૂટતો યોગ્ય word શોધો અને શીખો.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('teacher')}
              className="hover:text-amber-800 underline font-medium cursor-pointer"
            >
              Teacher Mode
            </button>
            <span>•</span>
            <span>20 Challenges • Level 1/2/3 • 3 Lives</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
