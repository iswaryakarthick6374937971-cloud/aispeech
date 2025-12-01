import { getSupportedLanguages } from '../services/translation';

interface LanguageSelectorProps {
  value: string;
  onChange: (lang: string) => void;
}

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const languages = getSupportedLanguages();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
    >
      {Object.entries(languages).map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}
