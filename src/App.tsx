import { useAuth } from './contexts/AuthContext';
import { WelcomePage } from './components/auth/WelcomePage';
import Index from './pages/Index';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <WelcomePage />;
  }

  return <Index />;
}

export default App;
