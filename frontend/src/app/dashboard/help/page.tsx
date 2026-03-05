'use client';

import { useState, useRef, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Badge, Accordion } from 'react-bootstrap';
import { FiMessageCircle, FiSend, FiUser, FiCpu, FiBook, FiHelpCircle, FiChevronRight } from 'react-icons/fi';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

const FAQS = [
  {
    q: 'How do I create a new matter?',
    a: 'Navigate to Matters → click "New Matter". Fill in the client, practice area, billing type, and description. The system auto-generates a matter number.',
  },
  {
    q: 'How do I record a trust account deposit?',
    a: 'Go to Trust Accounts → select an account → click "Deposit". Enter the amount, description, and reference number. The balance updates immediately.',
  },
  {
    q: 'How does the AI assistant work?',
    a: 'The AI assistant is powered by SiliconFlow\'s GLM-4 model. It can summarize documents, draft emails, suggest time entry descriptions, and answer legal workflow questions. Your data is processed via a secure API.',
  },
  {
    q: 'How do I log time against a matter?',
    a: 'Go to Time Entries → click "New Entry" or use the live timer. Select the matter, enter hours and a description. You can also use AI to auto-suggest a description.',
  },
  {
    q: 'Can I export reports?',
    a: 'The Analytics page currently shows live dashboards. Export functionality (PDF/Excel) is on the roadmap. Contact your admin to schedule scheduled report emails.',
  },
  {
    q: 'How do I invite a new user?',
    a: 'Admin users can create accounts via the API or by running the create_users.py script on the server. A self-service invite system is planned in Phase 2.',
  },
];

const QUICK_PROMPTS = [
  'Draft a client update email for a contract review matter',
  'Summarize the key obligations in a standard NDA',
  'What should I include in a time entry description for a client call?',
  'Help me write a professional billing reminder',
  'What are IOLTA account compliance requirements?',
];

export default function HelpPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI legal assistant powered by SiliconFlow GLM-4. I can help you draft emails, summarize documents, suggest billing descriptions, and answer questions about the platform. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userText = text ?? input.trim();
    if (!userText || isLoading) return;
    setInput('');

    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages([...newMessages, { role: 'assistant', content: '', loading: true }]);
    setIsLoading(true);

    try {
      const { data } = await api.post('/ai/completion', {
        prompt: userText,
        system_prompt:
          'You are a helpful AI assistant for a legal practice management system called Legal CMS. ' +
          'You help lawyers with drafting emails, summarizing documents, time entry descriptions, ' +
          'billing questions, and general legal workflow questions. Be concise, professional, and practical. ' +
          'Do not provide specific legal advice—refer users to qualified counsel for that.',
        max_tokens: 1024,
        temperature: 0.7,
      });

      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.response },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '⚠️ AI service unavailable. Please check your SILICONFLOW_API_KEY in the backend .env file.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Help & AI Assistant</h1>
        <p className="page-subtitle">Documentation, FAQs, and your personal AI legal assistant</p>
      </div>

      <Row className="g-4">
        {/* Left: FAQ + Docs */}
        <Col lg={5}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom py-3">
              <div className="d-flex align-items-center gap-2">
                <FiHelpCircle className="text-primary" />
                <strong>Frequently Asked Questions</strong>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Accordion flush>
                {FAQS.map((faq, i) => (
                  <Accordion.Item key={i} eventKey={String(i)}>
                    <Accordion.Header>{faq.q}</Accordion.Header>
                    <Accordion.Body className="text-muted" style={{ fontSize: '0.875rem' }}>
                      {faq.a}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <div className="d-flex align-items-center gap-2">
                <FiBook className="text-info" />
                <strong>Quick Links</strong>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {[
                { label: 'API Documentation', href: 'http://localhost:8000/api/docs', badge: 'Swagger' },
                { label: 'ReDoc API Reference', href: 'http://localhost:8000/api/redoc', badge: 'ReDoc' },
                { label: 'Project Outline & Roadmap', href: '#', badge: 'Internal' },
              ].map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d-flex align-items-center justify-content-between p-3 border-bottom text-decoration-none text-dark"
                  style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <FiChevronRight className="text-muted" />
                    {link.label}
                  </div>
                  <Badge bg="secondary">{link.badge}</Badge>
                </a>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Right: AI Chat */}
        <Col lg={7}>
          <Card className="shadow-sm" style={{ height: 680, display: 'flex', flexDirection: 'column' }}>
            <Card.Header className="bg-white border-bottom py-3">
              <div className="d-flex align-items-center gap-2">
                <FiCpu className="text-success" />
                <strong>AI Legal Assistant</strong>
                <Badge bg="success" className="ms-1">GLM-4 · SiliconFlow</Badge>
              </div>
            </Card.Header>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`d-flex gap-2 mb-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: msg.role === 'user' ? '#2563eb' : '#16a34a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    }}
                  >
                    {msg.role === 'user' ? <FiUser size={14} /> : <FiCpu size={14} />}
                  </div>
                  <div
                    style={{
                      maxWidth: '80%', padding: '0.625rem 0.875rem', borderRadius: 12,
                      background: msg.role === 'user' ? '#2563eb' : '#f1f5f9',
                      color: msg.role === 'user' ? '#fff' : '#1e293b',
                      fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.loading ? (
                      <div className="d-flex align-items-center gap-2">
                        <Spinner animation="border" size="sm" />
                        <span className="text-muted">Thinking…</span>
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-3 pb-2 d-flex gap-2" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
              {QUICK_PROMPTS.map(p => (
                <Button
                  key={p}
                  variant="outline-secondary"
                  size="sm"
                  style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}
                  onClick={() => sendMessage(p)}
                  disabled={isLoading}
                >
                  {p.length > 38 ? p.slice(0, 38) + '…' : p}
                </Button>
              ))}
            </div>

            {/* Input */}
            <Card.Footer className="bg-white border-top p-3">
              <div className="d-flex gap-2">
                <Form.Control
                  placeholder="Ask me anything — drafting, billing, legal workflows…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  disabled={isLoading}
                  style={{ fontSize: '0.875rem' }}
                />
                <Button variant="primary" onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
                  <FiSend />
                </Button>
              </div>
              <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                Press Enter to send · Shift+Enter for new line · Powered by SiliconFlow GLM-4
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
