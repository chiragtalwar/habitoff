import { useEffect, useState } from 'react';
import { getRandomQuote } from '@/lib/quotes';

export function QuoteDisplay() {
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
    <div className="max-w-3xl mx-auto text-center p-6 mb-8">
      <blockquote className="relative">
        <div className="relative z-10">
          <p className="text-white/90 text-xl md:text-2xl italic mb-4 leading-relaxed">
            "{quote.text}"
          </p>
          <footer className="text-white/70">
            <cite className="flex flex-col items-center not-italic">
              <span className="font-medium text-habit-success">— {quote.author}</span>
              <span className="text-sm mt-1 text-white/50">{quote.context}</span>
            </cite>
          </footer>
        </div>
        <div className="absolute top-0 left-0 transform -translate-x-6 -translate-y-8 text-habit-success/10 text-6xl font-serif">
          "
        </div>
        <div className="absolute bottom-0 right-0 transform translate-x-6 translate-y-8 text-habit-success/10 text-6xl font-serif">
          "
        </div>
      </blockquote>
    </div>
  );
} 