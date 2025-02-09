import { useAuth } from './contexts/AuthContext';
import { lazy, Suspense } from 'react';
import { useState } from 'react';
import { PremiumStatusButton } from './components/subscription/PremiumStatusButton';
import { UpgradeModal } from './components/subscription/UpgradeModal';
import Index from './pages/Index';

// Only lazy load WelcomePage since it's not critical
const WelcomePage = lazy(() => import('./components/auth/WelcomePage'));

function App() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Show loading state that matches the final UI
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 10, 100), rgba(0, 0, 0, 0.1)), url('/lovable-uploads/80968ddb-e188-4ea5-a8af-e82c7fa02f22.png'`,
        }}>
        <div className="container mx-auto pt-8 px-8">
          <h1 className="text-4xl font-thin tracking-[0.2em] bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
            HABITO
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {!user ? (
        <Suspense>
          <WelcomePage />
        </Suspense>
      ) : (
        <Index />
      )}
          
      {/* Premium Status Button & Modal */}
      <PremiumStatusButton onClick={() => setShowUpgradeModal(true)} />
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
}

export default App;
