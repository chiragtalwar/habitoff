import { useAuth } from './contexts/AuthContext';
import { lazy, Suspense } from 'react';
import { useState } from 'react';
import { PremiumStatusButton } from './components/subscription/PremiumStatusButton';
import { UpgradeModal } from './components/subscription/UpgradeModal';

// Lazy load components
const WelcomePage = lazy(() => import('./components/auth/WelcomePage'));
const Index = lazy(() => import('./pages/Index'));

function App() {
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          <Suspense>
            {!user ? <WelcomePage /> : <Index />}
          </Suspense>
          
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
