import { useAuth } from '@/contexts/AuthContext';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Habitoff Garden</h1>
          <div className="flex items-center gap-4">
            <img 
              src={user?.user_metadata.avatar_url} 
              alt={user?.user_metadata.full_name} 
              className="w-8 h-8 rounded-full"
            />
            <button 
              onClick={signOut}
              className="text-sm text-gray-700 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
} 