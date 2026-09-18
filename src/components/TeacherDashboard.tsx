import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  PlusCircle,
  Trash2,
  Download,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Question, StudentSession, GameLevel } from '../types';
import {
  getAllQuestions,
  saveCustomQuestion,
  deleteCustomQuestion,
  resetQuestionsToDefault,
  getStudentSessions,
  clearStudentSessions,
} from '../utils/storage';

interface TeacherDashboardProps {
  onBackToGame: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBackToGame }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'questions' | 'addQuestion'>('students');
  const [sessions, setSessions] = useState<StudentSession[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filterLevel, setFilterLevel] = useState<GameLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form state for adding new question
  const [newSentence, setNewSentence] = useState<string>('');
  const [newMissingWord, setNewMissingWord] = useState<string>('');
  const [newAlternatives, setNewAlternatives] = useState<string>('');
  const [newGujaratiTranslation, setNewGujaratiTranslation] = useState<string>('');
  const [newGujaratiHint, setNewGujaratiHint] = useState<string>('');
  const [newEnglishHint, setNewEnglishHint] = useState<string>('');
  const [newLevel, setNewLevel] = useState<GameLevel>(1);
  const [newCategory, setNewCategory] = useState<string>('Daily Life');
  const [formSuccess, setFormSuccess] = useState<string>('');

  useEffect(() => {
    setSessions(getStudentSessions());
    setQuestions(getAllQuestions());
  }, []);

  const refreshQuestions = () => {
    setQuestions(getAllQuestions());
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to remove this question?')) {
      deleteCustomQuestion(id);
      refreshQuestions();
    }
  };

  const handleResetQuestions = () => {
    if (confirm('Reset question bank back to default original questions?')) {
      resetQuestionsToDefault();
      refreshQuestions();
    }
  };

  const handleClearSessions = () => {
    if (confirm('Clear all student progress history logs?')) {
      clearStudentSessions();
      setSessions([]);
    }
  };

  const handleExportCSV = () => {
    if (sessions.length === 0) {
      alert('No student records to export.');
      return;
    }

    const headers = ['Student Name', 'Level', 'Final Score', 'Accuracy %', 'Correct', 'Total', 'Highest Streak', 'Date'];
    const rows = sessions.map(s => [
      `"${s.studentName}"`,
      s.level,
      s.totalScore,
      `${Math.round((s.correctCount / s.totalChallenges) * 100)}%`,
      s.correctCount,
      s.totalChallenges,
      s.highestStreak,
      `"${new Date(s.timestamp).toLocaleDateString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `missing_word_detective_students_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSentence.includes('____')) {
      alert('Please include "____" (four underscores) where the missing word belongs in the sentence.');
      return;
    }
    if (!newMissingWord.trim()) {
      alert('Please enter the missing word.');
      return;
    }

    const altList = newAlternatives
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const question: Question = {
      id: `custom-${Date.now()}`,
      sentence: newSentence.trim(),
      missingWord: newMissingWord.trim().toLowerCase(),
      alternatives: altList,
      gujaratiTranslation: newGujaratiTranslation.trim() || 'વાક્ય પૂર્ણ કરો.',
      gujaratiHint: newGujaratiHint.trim(),
      englishHint: newEnglishHint.trim(),
      level: newLevel,
      category: newCategory,
    };

    saveCustomQuestion(question);
    refreshQuestions();
    setFormSuccess('New Challenge Question added successfully! ✅');

    // Reset form
    setNewSentence('');
    setNewMissingWord('');
    setNewAlternatives('');
    setNewGujaratiTranslation('');
    setNewGujaratiHint('');
    setNewEnglishHint('');

    setTimeout(() => {
      setFormSuccess('');
      setActiveTab('questions');
    }, 1500);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesLevel = filterLevel === 'all' || q.level === filterLevel;
    const matchesSearch =
      searchQuery === '' ||
      q.sentence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.missingWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.gujaratiTranslation.includes(searchQuery);
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-3 sm:px-6">
      {/* Teacher Top Navigation */}
      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGame}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Game</span>
          </button>

          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>👩‍🏫 Teacher / Parent Dashboard</span>
            </h1>
            <p className="text-xs text-slate-500 font-gujarati">
              શિક્ષક મોડ: પ્રશ્ન બેંક સંચાલન અને વિદ્યાર્થી પ્રગતિ રિપોર્ટ
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'students'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Logs ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'questions'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Question Bank ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addQuestion')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'addQuestion'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Challenge</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Student Sessions History */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Performance Records</h2>
              <p className="text-xs text-slate-500">
                Track attempts, scores, accuracy, and streaks across classroom sessions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={sessions.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export to CSV</span>
              </button>

              <button
                onClick={handleClearSessions}
                disabled={sessions.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No student sessions recorded yet.</p>
              <p className="text-xs text-slate-500 font-gujarati mt-1">
                વિદ્યાર્થીઓ જ્યારે 20 પડકારો પૂરા કરશે ત્યારે તેમનો રેકોર્ડ અહીં દેખાશે.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Level</th>
                    <th className="py-3 px-3">Score</th>
                    <th className="py-3 px-3">Accuracy</th>
                    <th className="py-3 px-3">Max Streak</th>
                    <th className="py-3 px-3">Badge</th>
                    <th className="py-3 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map(s => {
                    const acc = Math.round((s.correctCount / s.totalChallenges) * 100);
                    return (
                      <tr key={s.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">{s.studentName}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border">
                            Level {s.level}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-700">
                          {s.totalScore.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-semibold text-emerald-700">
                          {acc}% ({s.correctCount}/{s.totalChallenges})
                        </td>
                        <td className="py-3 px-3 font-mono text-orange-600 font-semibold">
                          {s.highestStreak}x
                        </td>
                        <td className="py-3 px-3 capitalize font-semibold text-xs">
                          {s.badgeTier === 'gold' && '🥇 Gold'}
                          {s.badgeTier === 'silver' && '🥈 Silver'}
                          {s.badgeTier === 'bronze' && '🥉 Bronze'}
                          {s.badgeTier === 'cadet' && '🎖️ Cadet'}
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-500">
                          {new Date(s.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Question Bank Explorer */}
      {activeTab === 'questions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Current Question Bank</h2>
              <p className="text-xs text-slate-500">
                Manage all 75+ active missing-word sentences. Add, search, or filter.
              </p>
            </div>

            <button
              onClick={handleResetQuestions}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-amber-700 font-medium py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-amber-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sentence or word..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <button
                onClick={() => setFilterLevel('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterLevel === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setFilterLevel(1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterLevel === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Level 1
              </button>
              <button
                onClick={() => setFilterLevel(2)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterLevel === 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Level 2
              </button>
              <button
                onClick={() => setFilterLevel(3)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterLevel === 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Level 3
              </button>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50/50 hover:bg-amber-50/30 flex items-start justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border text-slate-600 font-mono">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      Level {q.level}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">[{q.category}]</span>
                  </div>

                  <p className="font-semibold text-slate-900 text-sm">
                    {q.sentence.split('____')[0]}
                    <span className="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold underline mx-1">
                      {q.missingWord}
                    </span>
                    {q.sentence.split('____')[1]}
                  </p>

                  <p className="text-xs text-slate-500 font-gujarati mt-0.5">
                    {q.gujaratiTranslation}
                  </p>
                </div>

                {q.id.startsWith('custom-') && (
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete custom question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Add Custom Challenge Question */}
      {activeTab === 'addQuestion' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="mb-4 pb-3 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Create Custom Missing Word Challenge</h2>
            <p className="text-xs text-slate-500 font-gujarati">
              નવો પ્રશ્ન ઉમેરો. વાક્યમાં જ્યાં શબ્દ ખૂટતો હોય ત્યાં <code className="font-mono bg-slate-100 px-1">____</code> (૪ અંડરસ્કોર) મૂકો.
            </p>
          </div>

          {formSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                English Sentence with ____ (Blank) *
              </label>
              <input
                type="text"
                required
                value={newSentence}
                onChange={e => setNewSentence(e.target.value)}
                placeholder="e.g. The sun rises in the ____."
                className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: Use 4 underscores <code className="font-mono text-amber-700 font-bold">____</code> for the missing blank space.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Missing Word (Correct Answer) *
                </label>
                <input
                  type="text"
                  required
                  value={newMissingWord}
                  onChange={e => setNewMissingWord(e.target.value)}
                  placeholder="e.g. east"
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Alternative Acceptable Answers (comma separated)
                </label>
                <input
                  type="text"
                  value={newAlternatives}
                  onChange={e => setNewAlternatives(e.target.value)}
                  placeholder="e.g. East, easterly"
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Gujarati Meaning / Translation (અર્થ) *
              </label>
              <input
                type="text"
                required
                value={newGujaratiTranslation}
                onChange={e => setNewGujaratiTranslation(e.target.value)}
                placeholder="e.g. સૂર્ય પૂર્વમાં ઊગે છે."
                className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-amber-500 outline-none font-gujarati"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Gujarati Hint (સંકેત)
                </label>
                <input
                  type="text"
                  value={newGujaratiHint}
                  onChange={e => setNewGujaratiHint(e.target.value)}
                  placeholder="e.g. દિશાનું નામ"
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-amber-500 outline-none font-gujarati"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  English Hint
                </label>
                <input
                  type="text"
                  value={newEnglishHint}
                  onChange={e => setNewEnglishHint(e.target.value)}
                  placeholder="e.g. Direction opposite to west"
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={newLevel}
                  onChange={e => setNewLevel(Number(e.target.value) as GameLevel)}
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-amber-500 outline-none bg-white"
                >
                  <option value={1}>🎯 Level 1 (Beginner / Easy)</option>
                  <option value={2}>🎯 Level 2 (Intermediate / Medium)</option>
                  <option value={3}>🎯 Level 3 (Advanced Detective)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-amber-500 outline-none bg-white"
                >
                  <option value="Daily Life">Daily Life</option>
                  <option value="Animals">Animals</option>
                  <option value="Nature">Nature</option>
                  <option value="School">School</option>
                  <option value="Grammar">Grammar</option>
                  <option value="Science">Science</option>
                  <option value="Idioms & Proverbs">Idioms & Proverbs</option>
                  <option value="Detective">Detective</option>
                </select>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save Challenge to Bank</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
