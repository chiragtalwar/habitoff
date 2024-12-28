import { useAuth } from '@/contexts/AuthContext';

export function WelcomePage() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-white space-y-6 text-center">
        <h1 className="text-5xl font-bold">Habitoff</h1>
        <p className="text-xl max-w-md">
          Transform your habits into a beautiful garden. Watch your plants grow as you maintain your streaks.
        </p>
        <button 
          onClick={signIn}
          className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-semibold shadow-lg transition-all"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
} 