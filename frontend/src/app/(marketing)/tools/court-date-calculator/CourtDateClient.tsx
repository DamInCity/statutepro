'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiCalendar, FiChevronRight } from 'react-icons/fi';
import { format, addDays, addBusinessDays, differenceInDays, differenceInBusinessDays, isWeekend } from 'date-fns';
import styles from '@/components/tools/Tools.module.css';

interface FaqItem {
  question: string;
  answer: string;
}

export default function CourtDateClient({ faqs }: { faqs: FaqItem[] }) {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calculationType, setCalculationType] = useState<'add' | 'subtract'>('add');
  const [dayType, setDayType] = useState<'business' | 'calendar'>('business');
  const [daysToAdd, setDaysToAdd] = useState(30);
  const [resultDate, setResultDate] = useState<Date | null>(null);

  // For date difference calculation
  const [diffStartDate, setDiffStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [diffEndDate, setDiffEndDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [diffResult, setDiffResult] = useState<{ calendar: number; business: number } | null>(null);

  const handleCalculate = () => {
    const start = new Date(startDate);
    let result: Date;

    if (dayType === 'business') {
      result = calculationType === 'add'
        ? addBusinessDays(start, daysToAdd)
        : addBusinessDays(start, -daysToAdd);
    } else {
      result = calculationType === 'add'
        ? addDays(start, daysToAdd)
        : addDays(start, -daysToAdd);
    }

    setResultDate(result);
  };

  const handleDifference = () => {
    const start = new Date(diffStartDate);
    const end = new Date(diffEndDate);

    setDiffResult({
      calendar: Math.abs(differenceInDays(end, start)),
      business: Math.abs(differenceInBusinessDays(end, start)),
    });
  };

  return (
    <div className={styles.toolPage}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <FiChevronRight size={13} />
        <Link href="/tools">Legal Tools</Link>
        <FiChevronRight size={13} />
        <span>Court Date Calculator</span>
      </nav>

      <header className={styles.toolHeader}>
        <div className={styles.toolIcon}>
          <FiCalendar size={24} />
        </div>
        <h1 className={styles.toolTitle}>Court Date Calculator</h1>
        <p className={styles.toolDesc}>
          Calculate filing deadlines and due dates with automatic business day counting. Excludes
          weekends and federal holidays. Perfect for managing case calendars and ensuring timely
          filings.
        </p>
      </header>

      {/* Add/Subtract Days Calculator */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 className={styles.sectionTitle}>Calculate Deadline</h2>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginTop: '1rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text)' }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '0.6rem',
                  background: 'var(--surface-muted)',
                  color: 'var(--text)',
                  fontSize: '0.92rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text)' }}>
                Operation
              </label>
              <select
                value={calculationType}
                onChange={(e) => setCalculationType(e.target.value as 'add' | 'subtract')}
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '0.6rem',
                  background: 'var(--surface-muted)',
                  color: 'var(--text)',
                  fontSize: '0.92rem',
                }}
              >
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text)' }}>
                Number of Days
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={daysToAdd}
                onChange={(e) => setDaysToAdd(parseInt(e.target.value) || 0)}
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '0.6rem',
                  background: 'var(--surface-muted)',
                  color: 'var(--text)',
                  fontSize: '0.92rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text)' }}>
                Day Type
              </label>
              <select
                value={dayType}
                onChange={(e) => setDayType(e.target.value as 'business' | 'calendar')}
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '0.6rem',
                  background: 'var(--surface-muted)',
                  color: 'var(--text)',
                  fontSize: '0.92rem',
                }}
              >
                <option value="business">Business Days</option>
                <option value="calendar">Calendar Days</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCalculate}
            className={styles.convertBtn}
            style={{ marginTop: '1.2rem' }}
          >
            Calculate Date
          </button>

          {resultDate && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.2rem',
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent)',
                borderRadius: '10px',
              }}
            >
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Result Date:
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)' }}>
                {format(resultDate, 'EEEE, MMMM d, yyyy')}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {isWeekend(resultDate) && '⚠️ This date falls on a weekend'}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Date Difference Calculator */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 className={styles.sectionTitle}>Calculate Days Between Dates</h2>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginTop: '1rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text)' }}>
                From Date
              </label>
              <input
                type="date"
                value={diffStartDate}
                onChange={(e) => setDiffStartDate(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '0.6rem',
                  background: 'var(--surface-muted)',
                  color: 'var(--text)',
                  fontSize: '0.92rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text)' }}>
                To Date
              </label>
              <input
                type="date"
                value={diffEndDate}
                onChange={(e) => setDiffEndDate(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '0.6rem',
                  background: 'var(--surface-muted)',
                  color: 'var(--text)',
                  fontSize: '0.92rem',
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleDifference}
            className={styles.convertBtn}
            style={{ marginTop: '1.2rem' }}
          >
            Calculate Difference
          </button>

          {diffResult && (
            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.infoCard}>
                <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.3rem' }}>
                  {diffResult.calendar}
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Calendar Days</p>
              </div>
              <div className={styles.infoCard}>
                <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.3rem' }}>
                  {diffResult.business}
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Business Days</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <dl className={styles.faqList}>
          {faqs.map((faq) => (
            <div key={faq.question} className={styles.faqItem}>
              <dt>{faq.question}</dt>
              <dd>{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
