import { useState } from 'react';
import { Sparkles, Search, Loader2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { NoteCard } from '../Notes/NoteCard';
import { Mic as LucideMic } from 'lucide-react';

export const AIRecall = () => {
  const { notes } = useData();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<typeof notes>([]);
  const [showResults, setShowResults] = useState(false);

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Voice recognition is not supported in your browser.');
    }
  };

  const performAISearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowResults(false);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const lowerQuery = query.toLowerCase();
    const searchResults = notes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(lowerQuery);
      const contentMatch = note.content?.toLowerCase().includes(lowerQuery);
      const tagMatch = note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));

      const words = lowerQuery.split(' ');
      const fuzzyMatch = words.some(
        (word) =>
          note.title.toLowerCase().includes(word) ||
          note.content?.toLowerCase().includes(word) ||
          note.tags.some((tag) => tag.toLowerCase().includes(word))
      );

      return titleMatch || contentMatch || tagMatch || fuzzyMatch;
    });

    searchResults.sort((a, b) => {
      const aScore =
        (a.title.toLowerCase().includes(lowerQuery) ? 10 : 0) +
        (a.content?.toLowerCase().includes(lowerQuery) ? 5 : 0) +
        a.tags.filter((tag) => tag.toLowerCase().includes(lowerQuery)).length;

      const bScore =
        (b.title.toLowerCase().includes(lowerQuery) ? 10 : 0) +
        (b.content?.toLowerCase().includes(lowerQuery) ? 5 : 0) +
        b.tags.filter((tag) => tag.toLowerCase().includes(lowerQuery)).length;

      return bScore - aScore;
    });

    setResults(searchResults);
    setShowResults(true);
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performAISearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8" />
          <h2 className="text-2xl font-bold">AI Memory Recall</h2>
        </div>
        <p className="text-white text-opacity-90 text-lg">
          Ask questions naturally and find your memories instantly
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What do you want to remember?"
                className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors"
                disabled={isListening || isSearching}
              />
              <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-6 h-6" />
            </div>
            <button
              onClick={handleVoiceInput}
              disabled={isListening || isSearching}
              className={`px-6 py-4 rounded-xl font-semibold transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
              }`}
              title="Voice input"
            >
              <LucideMic className="w-6 h-6" />
            </button>
            {/* Example usage of Lucide Mic icon */}
            <LucideMic size={32} color="#10b981" strokeWidth={2} />
          </div>

          <button
            onClick={performAISearch}
            disabled={isSearching || !query.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-xl text-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                Search with AI
              </>
            )}
          </button>
        </div>
      </div>

      {showResults && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Found {results.length} {results.length === 1 ? 'memory' : 'memories'}
          </h3>

          {results.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-xl font-bold text-gray-700 mb-2">No matches found</h4>
              <p className="text-gray-500 text-lg">
                Try rephrasing your question or use different keywords
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </div>
      )}

      {!showResults && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Try asking:</h3>
          <div className="space-y-3">
            {[
              'What did I save about my doctor appointment?',
              'Show me photos from last week',
              'Find my medication notes',
              'Where did I put my house keys?',
              'What was that recipe I saved?',
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="w-full text-left px-5 py-4 bg-white rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all text-lg border-2 border-transparent hover:border-purple-200"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
