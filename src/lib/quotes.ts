interface Quote {
    text: string;
    author: string;
    context: string;
  }
  
  export const quotes: Quote[] = [
    {
      text: "Your habits will determine your future.",
      author: "Jack Canfield",
      context: "Author of 'Chicken Soup for the Soul' series"
    },
    {
      text: "It's not what we do once in a while that shapes our lives, but what we do consistently.",
      author: "Tony Robbins",
      context: "World-renowned motivational speaker"
    },
    {
      text: "Quality is not an act, it is a habit.",
      author: "Aristotle",
      context: "Ancient Greek philosopher"
    },
    {
      text: "Winning is a habit. Unfortunately, so is losing.",
      author: "Vince Lombardi",
      context: "Legendary American football coach"
    },
    {
      text: "Successful people are simply those with successful habits.",
      author: "Brian Tracy",
      context: "Personal development expert"
    },
    {
      text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
      author: "Zig Ziglar",
      context: "Famous motivational speaker"
    },
    {
      text: "The chains of habit are too weak to be felt until they are too strong to be broken.",
      author: "Samuel Johnson",
      context: "18th-century English writer"
    },
    {
      text: "Courage is the most important of all virtues because without courage, you can't practice any other virtue consistently.",
      author: "Maya Angelou",
      context: "Acclaimed poet and civil rights activist"
    },
    {
      text: "The best way to predict the future is to create it.",
      author: "Peter Drucker",
      context: "Father of modern management"
    },
    {
      text: "Great things are not done by impulse, but by a series of small things brought together.",
      author: "Vincent Van Gogh",
      context: "Famous Dutch painter"
    },
    {
      text: "Happiness is not something ready-made. It comes from your own actions.",
      author: "Dalai Lama",
      context: "Spiritual leader of Tibetan Buddhism"
    },
    {
      text: "Habits are the building blocks of life. They are the things that shape our future.",
      author: "Robin Sharma",
      context: "Author of 'The Monk Who Sold His Ferrari'"
    },
    {
      text: "Motivation is what gets you started. Habit is what keeps you going.",
      author: "Jim Ryun",
      context: "Olympic athlete and motivational speaker"
    },
    {
      text: "Small deeds done are better than great deeds planned.",
      author: "Peter Marshall",
      context: "Inspirational pastor and writer"
    },
    {
      text: "First forget inspiration. Habit is more dependable. Habit will sustain you whether you're inspired or not.",
      author: "Octavia Butler",
      context: "Science fiction author"
    },
    {
      text: "Character is simply habit long continued.",
      author: "Plutarch",
      context: "Ancient Greek biographer and philosopher"
    },
    {
      text: "How we spend our days is, of course, how we spend our lives.",
      author: "Annie Dillard",
      context: "Pulitzer Prize-winning author"
    },
    {
      text: "The key is in not spending time, but in investing it.",
      author: "Stephen R. Covey",
      context: "Author of 'The 7 Habits of Highly Effective People'"
    },
    {
      text: "Discipline equals freedom.",
      author: "Jocko Willink",
      context: "Ex-Navy SEAL and leadership coach"
    },
    {
      text: "You do not rise to the level of your goals. You fall to the level of your systems.",
      author: "James Clear",
      context: "Author of 'Atomic Habits'"
    },
    {
      text: "Success is making those who believed in you look brilliant.",
      author: "Dharmesh Shah",
      context: "Co-founder of HubSpot"
    },
    {
      text: "Do not stop until you are proud.",
      author: "Elon Musk",
      context: "CEO of Tesla and SpaceX"
    },
    {
      text: "I've failed over and over again in my life. And that is why I succeed.",
      author: "Michael Jordan",
      context: "Basketball legend"
    },
    {
      text: "The difference between successful people and really successful people is that really successful people say no to almost everything.",
      author: "Warren Buffett",
      context: "Investment guru and philanthropist"
    },
    {
      text: "The best investment you can make is in yourself.",
      author: "Oprah Winfrey",
      context: "Media mogul and philanthropist"
    },
    {
      text: "Dream big, start small, but most of all, start.",
      author: "Simon Sinek",
      context: "Leadership expert and motivational speaker"
    },
    {
      text: "Focus on being productive instead of busy.",
      author: "Tim Ferriss",
      context: "Author of 'The 4-Hour Workweek'"
    },
    {
      text: "Be so good they can’t ignore you.",
      author: "Steve Martin",
      context: "Comedian and actor"
    },
    {
      text: "Opportunities don’t happen. You create them.",
      author: "Chris Grosser",
      context: "Photographer and entrepreneur"
    },
    {
      text: "Hustle beats talent when talent doesn’t hustle.",
      author: "Gary Vaynerchuk",
      context: "Entrepreneur and social media influencer"
    }
  ];
  
  export function getRandomQuote(): Quote {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }
  