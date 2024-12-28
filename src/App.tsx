import { useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { HabitGarden } from './components/habits/HabitGarden';
import { WelcomePage } from './components/auth/WelcomePage';

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

  return (
    <DashboardLayout>
      <HabitGarden />
    </DashboardLayout>
  );
}

export default App;
