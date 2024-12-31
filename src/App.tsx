import { useAuth } from './contexts/AuthContext';
import { lazy, Suspense } from 'react';

// Lazy load components
const WelcomePage = lazy(() => import('./components/auth/WelcomePage'));
const Index = lazy(() => import('./pages/Index'));

// Lightweight loading component
const LoadingFallback = () => (
  <div className="fixed inset-0 bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  const { user, isLoading } = useAuth();

  // Show minimal loading state
  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      {!user ? <WelcomePage /> : <Index />}
    </Suspense>
  );
}

export default App;
