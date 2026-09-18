import { Question, StudentSession, GameLevel } from '../types';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';

const CUSTOM_QUESTIONS_KEY = 'detective_custom_questions';
const SESSIONS_KEY = 'detective_student_sessions';

export function getAllQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    if (!raw) return DEFAULT_QUESTIONS;
    const custom: Question[] = JSON.parse(raw);
    // Combine custom questions with defaults without duplicate IDs
    const customIds = new Set(custom.map(q => q.id));
    const defaultsFiltered = DEFAULT_QUESTIONS.filter(q => !customIds.has(q.id));
    return [...custom, ...defaultsFiltered];
  } catch (err) {
    console.error('Failed to parse custom questions:', err);
    return DEFAULT_QUESTIONS;
  }
}

export function getQuestionsForLevel(level: GameLevel): Question[] {
  const all = getAllQuestions();
  return all.filter(q => q.level === level);
}

export function getRandomChallenges(level: GameLevel, count: number = 20): Question[] {
  const questions = getQuestionsForLevel(level);
  if (questions.length === 0) return [];
  
  // Shuffle questions using Fisher-Yates
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // If we have fewer questions than count, duplicate/cycle them cleanly
  if (shuffled.length >= count) {
    return shuffled.slice(0, count);
  } else {
    const result: Question[] = [];
    while (result.length < count) {
      result.push(...shuffled);
    }
    return result.slice(0, count);
  }
}

export function saveCustomQuestion(question: Question): boolean {
  try {
    const raw = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    const existing: Question[] = raw ? JSON.parse(raw) : [];
    const index = existing.findIndex(q => q.id === question.id);
    if (index >= 0) {
      existing[index] = question;
    } else {
      existing.unshift(question);
    }
    localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(existing));
    return true;
  } catch (err) {
    console.error('Failed to save question:', err);
    return false;
  }
}

export function deleteCustomQuestion(id: string): boolean {
  try {
    const raw = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    if (!raw) return false;
    const existing: Question[] = JSON.parse(raw);
    const updated = existing.filter(q => q.id !== id);
    localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to delete question:', err);
    return false;
  }
}

export function resetQuestionsToDefault(): void {
  try {
    localStorage.removeItem(CUSTOM_QUESTIONS_KEY);
  } catch (err) {
    console.error('Failed to reset questions:', err);
  }
}

export function saveStudentSession(session: StudentSession): void {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const sessions: StudentSession[] = raw ? JSON.parse(raw) : [];
    sessions.unshift(session);
    // Keep last 50 sessions
    const trimmed = sessions.slice(0, 50);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save student session:', err);
  }
}

export function getStudentSessions(): StudentSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load student sessions:', err);
    return [];
  }
}

export function clearStudentSessions(): void {
  try {
    localStorage.removeItem(SESSIONS_KEY);
  } catch (err) {
    console.error('Failed to clear sessions:', err);
  }
}
