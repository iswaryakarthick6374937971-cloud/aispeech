import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Languages, Trash2, Copy } from 'lucide-react';
import { translateText, textToSpeech } from './services/translation';
import LanguageSelector from './components/LanguageSelector';
import TranslationHistory from './components/TranslationHistory';

interface Translation {
  id: string;
  original: string;
  translated: string;
  fromLang: string;
  toLang: string;
  timestamp: number;
}

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('es');
  const [history, setHistory] = useState<Translation[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = fromLang;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleTranslate(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [fromLang]);

  const handleTranslate = async (text: string) => {
    if (!text.trim()) return;

    setIsTranslating(true);
    try {
      const translated = await translateText(text, fromLang, toLang);
      setTranslation(translated);

      const newTranslation: Translation = {
        id: Date.now().toString(),
        original: text,
        translated,
        fromLang,
        toLang,
        timestamp: Date.now(),
      };
      setHistory(prev => [newTranslation, ...prev].slice(0, 10));

      speak(translated);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setTranslation('');
      recognitionRef.current.lang = fromLang;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = toLang;
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Languages className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-800">Live Translator</h1>
          </div>
          <p className="text-slate-600">Speak in any language and get instant translation with voice output</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700">Source Language</h2>
              <LanguageSelector value={fromLang} onChange={setFromLang} />
            </div>

            <div className="mb-4">
              <button
                onClick={toggleListening}
                className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-6 h-6" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6" />
                    Start Speaking
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 min-h-32">
              <p className="text-slate-800 text-lg leading-relaxed">
                {transcript || (
                  <span className="text-slate-400 italic">
                    {isListening ? 'Listening...' : 'Click "Start Speaking" to begin'}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700">Target Language</h2>
              <LanguageSelector value={toLang} onChange={setToLang} />
            </div>

            <div className="mb-4">
              <button
                onClick={() => translation && speak(translation)}
                disabled={!translation || isSpeaking}
                className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all ${
                  translation && !isSpeaking
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Volume2 className={`w-6 h-6 ${isSpeaking ? 'animate-pulse' : ''}`} />
                {isSpeaking ? 'Speaking...' : 'Play Translation'}
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 min-h-32 relative">
              {isTranslating && (
                <div className="absolute inset-0 bg-slate-50 rounded-xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              <p className="text-slate-800 text-lg leading-relaxed">
                {translation || (
                  <span className="text-slate-400 italic">Translation will appear here</span>
                )}
              </p>
              {translation && (
                <button
                  onClick={() => copyToClipboard(translation)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-700">Translation History</h2>
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
            <TranslationHistory history={history} onSpeak={speak} onCopy={copyToClipboard} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
