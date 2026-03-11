import { useState } from 'react';
import { Leaf, Lightbulb, Dumbbell, Gamepad2, Heart } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { HealingContent } from '../../types';

export const HealingPath = () => {
  const { healingContent } = useData();
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'tip' | 'exercise' | 'game' | 'meditation'
  >('all');

  const filteredContent =
    selectedCategory === 'all'
      ? healingContent
      : healingContent.filter((item) => item.category === selectedCategory);

  const getCategoryIcon = (category: HealingContent['category']) => {
    switch (category) {
      case 'tip':
        return <Lightbulb className="w-6 h-6" />;
      case 'exercise':
        return <Dumbbell className="w-6 h-6" />;
      case 'game':
        return <Gamepad2 className="w-6 h-6" />;
      case 'meditation':
        return <Heart className="w-6 h-6" />;
    }
  };

  const getCategoryColor = (category: HealingContent['category']) => {
    switch (category) {
      case 'tip':
        return 'from-blue-400 to-cyan-400';
      case 'exercise':
        return 'from-orange-400 to-red-400';
      case 'game':
        return 'from-purple-400 to-pink-400';
      case 'meditation':
        return 'from-green-400 to-emerald-400';
    }
  };

  const getDifficultyColor = (difficulty: HealingContent['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Leaf className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Healing Path</h2>
        </div>
        <p className="text-white text-opacity-90 text-lg">
          Daily tips, exercises, and activities to support your memory journey
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-5 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedCategory('tip')}
          className={`px-5 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedCategory === 'tip'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Lightbulb className="w-5 h-5" />
          Tips
        </button>
        <button
          onClick={() => setSelectedCategory('exercise')}
          className={`px-5 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedCategory === 'exercise'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          Exercises
        </button>
        <button
          onClick={() => setSelectedCategory('game')}
          className={`px-5 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedCategory === 'game'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          Games
        </button>
        <button
          onClick={() => setSelectedCategory('meditation')}
          className={`px-5 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedCategory === 'meditation'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Heart className="w-5 h-5" />
          Meditation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredContent.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-gray-100 hover:border-emerald-200"
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`p-3 bg-gradient-to-br ${getCategoryColor(
                  item.category
                )} rounded-xl text-white flex-shrink-0`}
              >
                {getCategoryIcon(item.category)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(
                    item.difficulty
                  )}`}
                >
                  {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                </span>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No content found</h3>
          <p className="text-gray-500 text-lg">
            Try selecting a different category
          </p>
        </div>
      )}
    </div>
  );
};
