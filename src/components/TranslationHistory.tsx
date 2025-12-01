import { Volume2, Copy, ArrowRight } from 'lucide-react';
import { getSupportedLanguages } from '../services/translation';

interface Translation {
  id: string;
  original: string;
  translated: string;
  fromLang: string;
  toLang: string;
  timestamp: number;
}

interface TranslationHistoryProps {
  history: Translation[];
  onSpeak: (text: string) => void;
  onCopy: (text: string) => void;
}

export default function TranslationHistory({ history, onSpeak, onCopy }: TranslationHistoryProps) {
  const languages = getSupportedLanguages();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-3">
      {history.map((item) => (
        <div
          key={item.id}
          className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="font-medium">{languages[item.fromLang]}</span>
            <ArrowRight className="w-3 h-3" />
            <span className="font-medium">{languages[item.toLang]}</span>
            <span className="ml-auto">{formatTime(item.timestamp)}</span>
          </div>

          <div className="grid gap-2">
            <div className="flex items-start gap-2">
              <p className="flex-1 text-slate-600">{item.original}</p>
              <button
                onClick={() => onCopy(item.original)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                title="Copy original"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start gap-2 bg-slate-50 rounded p-2">
              <p className="flex-1 text-slate-800 font-medium">{item.translated}</p>
              <div className="flex gap-1">
                <button
                  onClick={() => onSpeak(item.translated)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Speak translation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onCopy(item.translated)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Copy translation"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
