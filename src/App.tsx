import { useAuth } from './contexts/AuthContext';
import { lazy, Suspense } from 'react';

// Lazy load components
const WelcomePage = lazy(() => import('./components/auth/WelcomePage'));
const Index = lazy(() => import('./pages/Index'));

function App() {
  const { user } = useAuth();

  return (
    <Suspense>
      {!user ? <WelcomePage /> : <Index />}
    </Suspense>
  );
}

export default App;
