import React, { useState, useEffect, useRef } from 'react';
import { Send, Lightbulb, Delete, Sparkles } from 'lucide-react';

interface WritingBoxProps {
  missingWord: string;
  englishHint?: string;
  gujaratiHint?: string;
  onSubmit: (answer: string) => void;
  isDisabled: boolean;
}

export const WritingBox: React.FC<WritingBoxProps> = ({
  missingWord,
  englishHint,
  gujaratiHint,
  onSubmit,
  isDisabled,
}) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showLetterTiles, setShowLetterTiles] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto focus on input when ready
  useEffect(() => {
    setInputVal('');
    setShowHint(false);
    if (!isDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [missingWord, isDisabled]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isDisabled) return;
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const cleanTarget = missingWord.trim().toLowerCase();
  const wordLength = cleanTarget.length;
  const firstLetter = cleanTarget[0] || '';

  // Letter tiles for easy tap input
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  const handleTileClick = (letter: string) => {
    if (isDisabled) return;
    setInputVal(prev => prev + letter);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleBackspace = () => {
    if (isDisabled) return;
    setInputVal(prev => prev.slice(0, -1));
  };

  return (
    <div className="w-full bg-white rounded-2xl border-2 border-amber-200/90 shadow-lg p-4 sm:p-6 transition-all">
      {/* Top hints row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Target Word:
          </span>
          {/* Word Length Dots / Dashes */}
          <div className="flex items-center gap-1.5 font-mono text-base font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            {Array.from({ length: wordLength }).map((_, idx) => {
              const enteredChar = inputVal[idx];
              return (
                <span
                  key={idx}
                  className={`inline-block w-4 sm:w-5 text-center border-b-2 ${
                    enteredChar ? 'border-amber-600 text-amber-900 font-extrabold' : 'border-slate-300 text-slate-300'
                  }`}
                >
                  {enteredChar ? enteredChar.toUpperCase() : '_'}
                </span>
              );
            })}
            <span className="text-xs text-slate-400 font-normal ml-1">({wordLength} letters)</span>
          </div>
        </div>

        {/* Hint Trigger Button */}
        <button
          type="button"
          onClick={() => setShowHint(prev => !prev)}
          className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            showHint
              ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
              : 'bg-slate-100 hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-300'
          }`}
          title="Show detective clue"
        >
          <Lightbulb className={`w-4 h-4 ${showHint ? 'text-amber-600 fill-amber-500' : 'text-slate-500'}`} />
          <span>{showHint ? 'Hide Clue' : 'Clue / સંકેત'}</span>
        </button>
      </div>

      {/* Clue Box when revealed */}
      {showHint && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-slate-700 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">
                Starts with letter <span className="underline font-bold text-base uppercase text-amber-700">"{firstLetter}"</span>
              </p>
              {englishHint && <p className="text-xs text-slate-600">English: {englishHint}</p>}
              {gujaratiHint && <p className="text-xs text-amber-900 font-gujarati">ગુજરાતી: {gujaratiHint}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Writing Box Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
        <div className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            id="detective-writing-box"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            placeholder="Type missing word here (અહીં શબ્દ લખો)..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            autoCapitalize="none"
            className="w-full text-lg sm:text-2xl font-bold text-slate-800 placeholder:text-slate-400 placeholder:text-sm sm:placeholder:text-base placeholder:font-normal py-3.5 px-4 rounded-xl border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed shadow-inner"
          />

          {inputVal.length > 0 && !isDisabled && (
            <button
              type="button"
              onClick={() => setInputVal('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md text-xs font-semibold"
              title="Clear input"
            >
              Clear
            </button>
          )}
        </div>

        <button
          type="submit"
          id="submit-word-btn"
          disabled={isDisabled || !inputVal.trim()}
          className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white font-bold text-base shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Check Word</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Virtual letter keyboard toggle for young kids / touchscreen */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <button
          type="button"
          onClick={() => setShowLetterTiles(prev => !prev)}
          className="hover:text-amber-700 underline font-medium cursor-pointer"
        >
          {showLetterTiles ? 'Hide Letter Keyboard' : '🔤 Open On-Screen Letter Tiles (for kids & tablets)'}
        </button>
        <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-[11px] font-mono">Enter ↵</kbd> to submit</span>
      </div>

      {/* Letter Keyboard Tiles */}
      {showLetterTiles && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5 max-w-xl mx-auto">
            {alphabet.map(char => (
              <button
                key={char}
                type="button"
                onClick={() => handleTileClick(char)}
                disabled={isDisabled}
                className="w-8 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-100 hover:bg-amber-100 active:bg-amber-200 border border-slate-300 hover:border-amber-400 text-slate-800 font-bold text-sm sm:text-base transition-colors flex items-center justify-center shadow-xs"
              >
                {char.toUpperCase()}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              disabled={isDisabled}
              className="px-3 h-9 sm:h-10 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs flex items-center gap-1"
              title="Backspace"
            >
              <Delete className="w-3.5 h-3.5" />
              <span>DEL</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
