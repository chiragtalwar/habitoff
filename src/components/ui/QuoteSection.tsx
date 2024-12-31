import { useEffect, useState } from "react";
import { getRandomQuote } from "@/lib/quotes";

export const QuoteSection = () => {
  const [quote, setQuote] = useState(getRandomQuote());

  useEffect(() => {
    // Update quote when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setQuote(getRandomQuote());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
      <div className="text-center max-w-lg relative">
        <div className="absolute -left-6 -top-6 text-habit-success/10 text-6xl font-serif">
          "
        </div>
        <p className="font-serif text-2xl text-white mb-4 leading-relaxed">
          {quote.text}
        </p>
        <div className="flex flex-col items-center">
          <p className="font-serif text-lg text-white/80 italic">
            — {quote.author}
          </p>
          <p className="text-sm text-white/50 mt-1 italic">
            {quote.context}
          </p>
        </div>
        <div className="absolute -right-6 -bottom-6 text-habit-success/10 text-6xl font-serif">
          "
        </div>
      </div>
    </div>
  );
};