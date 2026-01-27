
import React from 'react';

interface HighlightTextProps {
  text: string;
  isEnabled: boolean;
}

const HighlightText: React.FC<HighlightTextProps> = ({ text, isEnabled }) => {
  if (!isEnabled) return <div className="whitespace-pre-wrap">{text}</div>;

  const entityRegex = /(https?:\/\/[^\s]+)|([$€£₦¥]|RS\.|USD)\s?(\d+([.,]\d+)?)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\+?\d{1,4}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}|\b(send|pay|deliver|confirm|payment|received|ordered|bank|transfer)\b/gi;

  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-4"></div>;
        
        const lineParts = line.split(entityRegex);
        return (
          <div key={idx} className="min-h-[1.5em] leading-relaxed">
            {lineParts.map((part, pIdx) => {
              if (part === undefined || part === '') return null;
              
              const isEntity = part.match(entityRegex);

              if (isEntity) {
                let styleClasses = 'bg-blue-50 text-blue-700 border-blue-100';
                if (part.match(/[$€£₦¥]/)) styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                if (part.match(/\b(send|pay|confirm|deliver|bank|transfer)\b/i)) styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
                if (part.match(/@/)) styleClasses = 'bg-indigo-50 text-indigo-700 border-indigo-100';

                return (
                  <span key={pIdx} className={`${styleClasses} px-1.5 py-0.5 rounded-md border text-[12px] font-semibold mx-0.5 inline-block transition-all hover:brightness-95`}>
                    {part}
                  </span>
                );
              }
              return <span key={pIdx} className="opacity-90">{part}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export default HighlightText;
