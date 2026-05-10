import React, { useState, useRef, useEffect } from 'react';

interface CaptionLabProps {
  onCopy: (text: string) => void;
}

interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
  isCaption?: boolean;
}

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Instagram caption for a golden hour selfie ✨',
  'YouTube description for a travel vlog in Jeju',
  '인스타 감성 카페 사진 문구 써줘 (해시태그 포함)',
  'Short TikTok caption for a cooking video',
];

const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-4 py-3 bg-white rounded-2xl rounded-tl-sm border border-pink-100 shadow-sm w-fit">
    {[0, 150, 300].map((delay) => (
      <span
        key={delay}
        className="w-2 h-2 bg-pink-300 rounded-full animate-bounce"
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </div>
);

const CaptionLab: React.FC<CaptionLabProps> = ({ onCopy }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [feedbackIdx, setFeedbackIdx] = useState<Record<number, 'up' | 'down'>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (forcedInput?: string) => {
    const userText = (forcedInput ?? input).trim();
    if (!userText || loading) return;

    setInput('');
    const userMsg: ChatMessage = { type: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);

    const newHistory: HistoryMessage[] = [...history, { role: 'user', content: userText }];
    setHistory(newHistory);
    setLoading(true);

    try {
      const res = await fetch('/api/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (typeof data.message !== 'string') throw new Error();

      const aiMsg: ChatMessage = { type: 'ai', text: data.message, isCaption: !!data.isCaption };
      setMessages(prev => [...prev, aiMsg]);
      setHistory(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      const errMsg: ChatMessage = { type: 'ai', text: 'Something went wrong. Please try again!', isCaption: false };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    onCopy(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto py-8 custom-scrollbar">
        <div className="max-w-2xl mx-auto px-4 space-y-4">

          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl flex items-center justify-center shadow-inner">
                <i className="fas fa-pen-nib text-3xl text-pink-400" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-stone-700 mb-2">Caption Lab</h2>
                <p className="text-stone-400 font-medium text-sm max-w-sm">
                  Chat freely or ask me to write a caption — I'll match your language and follow your instructions.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-md">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-sm text-left font-medium text-stone-600 bg-white hover:bg-pink-500 hover:text-white border border-pink-100 px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.type === 'user' && (
                <div className="flex justify-end">
                  <div className="bg-pink-500 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] font-semibold shadow-md shadow-pink-200/60 text-sm leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              )}

              {msg.type === 'ai' && (
                <div className="max-w-xl">
                  <div className={`bg-white border rounded-2xl rounded-tl-sm shadow-sm ${
                    msg.isCaption ? 'border-pink-100' : 'border-stone-100'
                  }`}>
                    <p className="text-stone-700 leading-relaxed text-sm whitespace-pre-wrap px-5 py-4">
                      {msg.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 px-1">
                    <button
                      onClick={() => handleCopy(msg.text, idx)}
                      title="Copy"
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        copiedIdx === idx
                          ? 'text-green-500'
                          : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {copiedIdx === idx
                        ? <><i className="fas fa-check" /><span>Copied</span></>
                        : <><i className="far fa-copy" /><span>Copy</span></>
                      }
                    </button>
                    <div className="w-px h-3.5 bg-stone-200 mx-0.5" />
                    <button
                      onClick={() => setFeedbackIdx(prev => ({ ...prev, [idx]: prev[idx] === 'up' ? undefined as any : 'up' }))}
                      title="Good response"
                      className={`p-1.5 rounded-lg text-xs transition-all ${
                        feedbackIdx[idx] === 'up'
                          ? 'text-pink-500 bg-pink-50'
                          : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <i className="far fa-thumbs-up" />
                    </button>
                    <button
                      onClick={() => setFeedbackIdx(prev => ({ ...prev, [idx]: prev[idx] === 'down' ? undefined as any : 'down' }))}
                      title="Bad response"
                      className={`p-1.5 rounded-lg text-xs transition-all ${
                        feedbackIdx[idx] === 'down'
                          ? 'text-stone-600 bg-stone-100'
                          : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <i className="far fa-thumbs-down" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && <TypingDots />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t-2 border-pink-100 bg-white shadow-[0_-8px_32px_rgba(236,72,153,0.08)]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-center p-2 rounded-2xl bg-pink-50 border-2 border-pink-200 focus-within:border-pink-400 focus-within:shadow-[0_0_0_4px_rgba(236,72,153,0.1)] transition-all">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 px-3 py-2 bg-transparent text-stone-800 placeholder:text-stone-300 focus:outline-none text-sm"
              placeholder='Ask anything, or say "Write an Instagram caption for..."'
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="
                shrink-0 px-5 py-2.5
                bg-pink-500 text-white font-black text-sm rounded-xl
                border-b-4 border-pink-700
                hover:bg-pink-400 hover:border-pink-600
                active:border-b-0 active:translate-y-[3px]
                disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4
                transition-all duration-75 shadow-md shadow-pink-400/30
                select-none flex items-center gap-2
              "
            >
              {loading
                ? <><i className="fas fa-circle-notch fa-spin" /><span>Thinking...</span></>
                : <><i className="fas fa-paper-plane" /><span>Send</span></>
              }
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CaptionLab;
