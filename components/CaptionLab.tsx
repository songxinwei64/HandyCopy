import React, { useState } from 'react';

interface CaptionLabProps {
  onCopy: (text: string) => void;
}

const SUGGESTIONS = [
  'cafe photo, soft morning mood',
  'new product launch',
  'golden hour selfie',
  'rainy day at home',
  '오늘 카페에서 찍은 사진',
];

const CaptionLab: React.FC<CaptionLabProps> = ({ onCopy }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async (forcedTopic?: string) => {
    const finalTopic = forcedTopic ?? topic;
    if (!finalTopic.trim()) {
      setError('Please enter a topic first!');
      return;
    }
    if (forcedTopic) setTopic(forcedTopic);
    setError('');
    setLoading(true);
    setCaptions([]);

    try {
      const res = await fetch('/api/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: finalTopic.trim() }),
      });

      if (!res.ok) throw new Error('Generation failed');

      const data = await res.json();
      if (!data.captions || !Array.isArray(data.captions)) throw new Error('Invalid response');
      setCaptions(data.captions);
    } catch {
      setError('Something went wrong. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    onCopy(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Input Card */}
      <div className="bg-gradient-to-br from-[#fff0f6] via-[#fffbfe] to-[#fce7f3] p-10 rounded-[2.5rem] border border-pink-100 shadow-xl shadow-pink-100/20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 -left-10 w-32 h-32 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-pink-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
              <i className="fas fa-pen-nib" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-stone-800">Caption Lab</h2>
          </div>
          <p className="text-stone-500 mb-8 text-base font-medium">
            Describe your photo or mood — AI writes captions you can post right away.
          </p>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              className="w-full px-6 py-4 rounded-2xl bg-white border border-pink-100 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-200 text-base transition-all shadow-sm"
              placeholder='e.g. "cafe photo, soft morning mood"'
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            {error && (
              <p className="text-rose-400 text-sm font-semibold px-1">{error}</p>
            )}
            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className="px-8 py-4 bg-pink-500 text-white font-black rounded-2xl hover:bg-pink-600 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-lg shadow-pink-500/20"
            >
              {loading
                ? <><i className="fas fa-circle-notch fa-spin" /> Generating...</>
                : <><i className="fas fa-sparkles" /> Generate Captions</>}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Try:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleGenerate(s)}
                className="text-xs font-bold text-stone-600 bg-white/70 hover:bg-pink-500 hover:text-white border border-pink-100 px-3 py-1.5 rounded-xl transition-all shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-pink-50 p-5 animate-pulse">
              <div className="h-4 bg-pink-50 rounded-full w-3/4 mb-2" />
              <div className="h-4 bg-pink-50 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Caption cards */}
      {!loading && captions.length > 0 && (
        <div className="space-y-3">
          {captions.map((caption, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-pink-100 p-5 flex items-start justify-between gap-4 shadow-sm hover:shadow-md hover:border-pink-200 transition-all"
            >
              <p className="text-stone-700 font-medium leading-relaxed flex-1">{caption}</p>
              <button
                onClick={() => handleCopy(caption, i)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  copiedIndex === i
                    ? 'bg-green-100 text-green-600'
                    : 'bg-pink-50 text-pink-500 hover:bg-pink-500 hover:text-white'
                }`}
              >
                {copiedIndex === i ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && captions.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-pink-50/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <i className="fas fa-pen-nib text-4xl text-pink-200" />
          </div>
          <p className="text-stone-300 font-bold text-base tracking-wide">
            Enter a topic to generate your captions
          </p>
        </div>
      )}
    </div>
  );
};

export default CaptionLab;
