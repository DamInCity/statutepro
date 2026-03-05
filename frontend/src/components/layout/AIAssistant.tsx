'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { FiMessageCircle, FiX, FiSend, FiCpu, FiUser, FiMinus } from 'react-icons/fi';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

const SYSTEM_PROMPT =
  'You are a helpful AI assistant embedded in Legal CMS, a legal practice management system. ' +
  'Help lawyers with drafting emails, summarizing documents, billing descriptions, ' +
  'deadline tracking, client communication, and platform usage. ' +
  'Be concise and practical. Do not provide specific legal advice.';

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your AI assistant. Ask me to draft emails, suggest billing descriptions, or summarize documents.' },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !minimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, minimized]);

  const send = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput('');

    const history = [...messages, { role: 'user' as const, content: msg }];
    setMessages([...history, { role: 'assistant', content: '', loading: true }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        messages: history.map(m => ({ role: m.role, content: m.content })),
        system_prompt: SYSTEM_PROMPT,
      });
      setMessages([...history, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages([...history, { role: 'assistant', content: '⚠️ AI unavailable. Check SILICONFLOW_API_KEY.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 52, height: 52, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #2563eb, #16a34a)',
          color: '#fff', cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        title="AI Assistant"
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <FiCpu size={22} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        width: 360, borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
        height: minimized ? 'auto' : 520,
        background: '#fff',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b, #2563eb)',
          color: '#fff', padding: '0.75rem 1rem',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <FiCpu size={18} />
        <span style={{ fontWeight: 600, flex: 1, fontSize: '0.9rem' }}>AI Legal Assistant</span>
        <button onClick={() => setMinimized(m => !m)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 2 }}>
          <FiMinus size={16} />
        </button>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 2 }}>
          <FiX size={16} />
        </button>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', background: '#f8fafc' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`d-flex gap-2 mb-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'user' ? '#2563eb' : '#16a34a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}>
                  {msg.role === 'user' ? <FiUser size={12} /> : <FiCpu size={12} />}
                </div>
                <div style={{
                  maxWidth: '80%', padding: '0.5rem 0.75rem', borderRadius: 10,
                  background: msg.role === 'user' ? '#2563eb' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#1e293b',
                  fontSize: '0.8rem', lineHeight: 1.5, whiteSpace: 'pre-wrap',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                }}>
                  {msg.loading ? (
                    <div className="d-flex align-items-center gap-2">
                      <Spinner animation="border" size="sm" />
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Thinking…</span>
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '0.75rem', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
            <div className="d-flex gap-2">
              <Form.Control
                size="sm"
                placeholder="Ask me anything…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                disabled={loading}
                style={{ fontSize: '0.8rem', borderRadius: 8 }}
              />
              <Button size="sm" variant="primary" onClick={() => send()} disabled={loading || !input.trim()} style={{ borderRadius: 8 }}>
                <FiSend size={14} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
