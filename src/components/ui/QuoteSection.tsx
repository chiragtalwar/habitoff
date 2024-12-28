import { useState } from "react";

const quotes = [
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
];

export const QuoteSection = () => {
  const [currentQuote, setCurrentQuote] = useState(0);

  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % quotes.length);
  };

  const prevQuote = () => {
    setCurrentQuote((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
      <div className="text-center max-w-lg">
        <p className="font-serif text-2xl text-white mb-4 leading-relaxed">
          "{quotes[currentQuote].text}"
        </p>
        <p className="font-serif text-lg text-white/80 italic">
          - {quotes[currentQuote].author}
        </p>
      </div>
      <div className="flex gap-4 mt-6">
        <button
          onClick={prevQuote}
          className="text-white/80 hover:text-white transition-colors"
        >
          ←
        </button>
        <button
          onClick={nextQuote}
          className="text-white/80 hover:text-white transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
};