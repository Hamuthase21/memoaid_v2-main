import { BookOpen, Sparkles, Bell, Leaf } from 'lucide-react';

interface NavigationProps {
  activeTab: 'notes' | 'ai' | 'reminders' | 'healing' | 'gemini';
  onTabChange: (tab: 'notes' | 'ai' | 'reminders' | 'healing' | 'gemini') => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'notes' as const, label: 'My Memories', icon: BookOpen },
    { id: 'ai' as const, label: 'AI Recall', icon: Sparkles },
    { id: 'reminders' as const, label: 'Reminders', icon: Bell },
    { id: 'healing' as const, label: 'Healing Path', icon: Leaf },
    { id: 'gemini' as const, label: 'Gemini Chat', icon: Sparkles },
  ];

  return (
    <nav className="bg-white border-b-2 border-gray-100 sticky top-[73px] z-30 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
