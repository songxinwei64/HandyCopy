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

const MODES = ['Instagram', 'TikTok', 'YouTube', 'Bio', '🇰🇷 Korean', '🌏 English'];

const SUGGESTIONS = [
  { icon: '🌅', text: 'Instagram caption for a golden hour selfie ✨' },
  { icon: '🍳', text: 'Short TikTok caption for a cooking video' },
  { icon: '☕', text: '인스타 감성 카페 사진 문구 써줘 (해시태그 포함)' },
  { icon: '✈️', text: '제주도 여행 유튜브 영상 설명글 써줘' },
];

const TypingDots = () => (
  <div
    className="flex items-center gap-1.5 px-4 py-3 bg-white w-fit"
    style={{ border: '1.5px solid #ffb8d8', borderRadius: '4px 18px 18px 18px', boxShadow: '0 3px 0 #ffe0f0' }}
  >
    {[0, 150, 300].map((delay) => (
      <span
        key={delay}
        className="w-2 h-2 rounded-full animate-bounce"
        style={{ background: '#ec3d97', animationDelay: `${delay}ms` }}
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
  const [regenerating, setRegenerating] = useState<Record<number, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (forcedInput?: string) => {
    const userText = (forcedInput ?? input).trim();
    if (!userText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userText }]);
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

      setMessages(prev => [...prev, { type: 'ai', text: data.message, isCaption: !!data.isCaption }]);
      setHistory(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, { type: 'ai', text: 'Something went wrong. Please try again!', isCaption: false }]);
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

  const handleRegenerate = async (idx: number) => {
    if (loading || regenerating[idx]) return;
    setFeedbackIdx(prev => ({ ...prev, [idx]: 'down' }));
    setRegenerating(prev => ({ ...prev, [idx]: true }));

    const regenPrompt: HistoryMessage = {
      role: 'user',
      content: "I didn't like that response. Please rewrite it with a different style or approach.",
    };
    const historyForRegen = [...history, regenPrompt];

    try {
      const res = await fetch('/api/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForRegen }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (typeof data.message !== 'string') throw new Error();

      setMessages(prev => [...prev, { type: 'ai', text: data.message, isCaption: !!data.isCaption }]);
      setHistory(prev => [...prev, regenPrompt, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, { type: 'ai', text: 'Something went wrong. Please try again!', isCaption: false }]);
    } finally {
      setRegenerating(prev => ({ ...prev, [idx]: false }));
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full" style={{ background: '#fff7fb' }}>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto py-8 custom-scrollbar">
        <div className="max-w-2xl mx-auto px-4 space-y-5">

          {/* Hero empty state */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
              <div
                className="w-full max-w-md p-7 text-center"
                style={{
                  background: 'white',
                  border: '2px solid #ffb8d8',
                  borderRadius: '28px',
                  boxShadow: '0 8px 0 #ffe0f0, 0 16px 40px rgba(236,61,151,0.07)',
                }}
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 mx-auto mb-4 flex items-center justify-center text-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #ffe0f0 0%, #ffc8e8 100%)',
                    borderRadius: '18px',
                    border: '2px solid #ffb8d8',
                    boxShadow: '0 4px 0 #f4b8d5',
                  }}
                >
                  ✨
                </div>

                <h2 className="text-2xl font-black mb-1" style={{ color: '#2b1b25' }}>
                  Caption Lab
                </h2>
                <p className="text-sm mb-5" style={{ color: '#9b7f8f' }}>
                  Generate captions, bios and post ideas in seconds.
                </p>

                {/* Mode chips */}
                <div className="flex flex-wrap justify-center gap-2 mb-5">
                  {MODES.map(mode => (
                    <button
                      key={mode}
                      onClick={() => handleSend(`Write a ${mode} caption`)}
                      className="px-3 py-1.5 text-xs font-bold transition-all duration-150"
                      style={{
                        background: '#fff0f8',
                        color: '#ec3d97',
                        border: '1.5px solid #ffb8d8',
                        borderRadius: '10px',
                        boxShadow: '0 3px 0 #f4b8d5',
                      }}
                      onMouseEnter={e => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.transform = 'translateY(-2px)';
                        btn.style.background = '#ec3d97';
                        btn.style.color = 'white';
                      }}
                      onMouseLeave={e => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.transform = '';
                        btn.style.background = '#fff0f8';
                        btn.style.color = '#ec3d97';
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Suggestion prompts */}
                <div className="flex flex-col gap-2 text-left">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s.text}
                      onClick={() => handleSend(s.text)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150"
                      style={{
                        background: '#fff7fb',
                        border: '1.5px solid #ffe0f0',
                        borderRadius: '12px',
                        color: '#9b7f8f',
                      }}
                      onMouseEnter={e => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.borderColor = '#ffb8d8';
                        btn.style.background = '#fff0f8';
                        btn.style.color = '#2b1b25';
                      }}
                      onMouseLeave={e => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.borderColor = '#ffe0f0';
                        btn.style.background = '#fff7fb';
                        btn.style.color = '#9b7f8f';
                      }}
                    >
                      <span className="text-base shrink-0">{s.icon}</span>
                      <span>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.type === 'user' && (
                <div className="flex justify-end">
                  <div
                    className="px-5 py-3 max-w-[80%] text-sm font-semibold leading-relaxed"
                    style={{
                      background: '#ec3d97',
                      color: 'white',
                      border: '2px solid #2b1b25',
                      borderRadius: '18px 18px 4px 18px',
                      boxShadow: '0 4px 0 #b61762',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              )}

              {msg.type === 'ai' && (
                <div className="max-w-xl">
                  <div
                    className="bg-white"
                    style={{
                      border: `1.5px solid ${msg.isCaption ? '#ffb8d8' : '#f0e8ed'}`,
                      borderRadius: '4px 18px 18px 18px',
                      boxShadow: msg.isCaption ? '0 4px 0 #ffe0f0' : '0 2px 8px rgba(43,27,37,0.05)',
                    }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap px-5 py-4" style={{ color: '#2b1b25' }}>
                      {msg.text}
                    </p>
                  </div>
                  {/* Action bar */}
                  <div className="flex items-center gap-1 mt-1.5 px-1">
                    <button
                      onClick={() => handleCopy(msg.text, idx)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                      style={{ color: copiedIdx === idx ? '#10b981' : '#9b7f8f' }}
                      onMouseEnter={e => { if (copiedIdx !== idx) (e.currentTarget as HTMLButtonElement).style.background = '#fff0f8'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; }}
                    >
                      {copiedIdx === idx
                        ? <><i className="fas fa-check" /><span>Copied</span></>
                        : <><i className="far fa-copy" /><span>Copy</span></>
                      }
                    </button>
                    <div className="w-px h-3.5 mx-0.5" style={{ background: '#ffe0f0' }} />
                    <button
                      onClick={() => setFeedbackIdx(prev => ({ ...prev, [idx]: prev[idx] === 'up' ? undefined as any : 'up' }))}
                      className="p-1.5 rounded-lg text-xs transition-all duration-150"
                      style={{ color: feedbackIdx[idx] === 'up' ? '#ec3d97' : '#9b7f8f', background: feedbackIdx[idx] === 'up' ? '#fff0f8' : '' }}
                    >
                      <i className="far fa-thumbs-up" />
                    </button>
                    <button
                      onClick={() => handleRegenerate(idx)}
                      disabled={regenerating[idx]}
                      className="p-1.5 rounded-lg text-xs transition-all duration-150"
                      style={{ color: feedbackIdx[idx] === 'down' ? '#ec3d97' : '#9b7f8f', background: feedbackIdx[idx] === 'down' ? '#fff0f8' : '' }}
                      title="Regenerate"
                    >
                      {regenerating[idx]
                        ? <i className="fas fa-circle-notch fa-spin" />
                        : <i className="far fa-thumbs-down" />
                      }
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
      <div className="shrink-0 bg-white" style={{ borderTop: '2px solid #ffb8d8' }}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div
            className="flex gap-3 items-center p-2"
            style={{
              background: 'white',
              border: '2px solid #ffb8d8',
              borderRadius: '20px',
              boxShadow: '0 5px 0 #f4c8dc',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-sm"
              placeholder='Ask anything, or say "Write an Instagram caption for..."'
              style={{ color: '#2b1b25' }}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="shrink-0 px-5 py-2.5 text-white font-black text-sm flex items-center gap-2 select-none disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: '#ec3d97',
                border: '2px solid #2b1b25',
                borderRadius: '14px',
                boxShadow: '0 4px 0 #b61762',
                transition: 'all 0.07s ease',
              }}
              onMouseEnter={e => {
                if (!loading && input.trim()) {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.transform = 'translateY(-2px)';
                  btn.style.boxShadow = '0 6px 0 #b61762';
                }
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.transform = '';
                btn.style.boxShadow = '0 4px 0 #b61762';
              }}
              onMouseDown={e => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.transform = 'translateY(3px)';
                btn.style.boxShadow = '0 1px 0 #b61762';
              }}
              onMouseUp={e => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.transform = '';
                btn.style.boxShadow = '0 4px 0 #b61762';
              }}
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
