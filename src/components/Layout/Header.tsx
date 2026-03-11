import { LogOut, Brain } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b-2 border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">MemoAid</h1>
              <p className="text-sm text-gray-600">Your Memory Companion</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-base font-semibold text-gray-800">{user?.fullName}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-3 hover:bg-red-50 rounded-xl transition-colors text-red-600 flex items-center gap-2 font-semibold"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
