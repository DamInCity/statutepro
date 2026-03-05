'use client';

import { FormEvent, useState } from 'react';
import styles from './Marketing.module.css';

interface LeadFormProps {
  intent: 'demo' | 'contact';
  title: string;
}

interface LeadFormState {
  fullName: string;
  workEmail: string;
  firmName: string;
  teamSize: string;
  details: string;
}

const initialState: LeadFormState = {
  fullName: '',
  workEmail: '',
  firmName: '',
  teamSize: '',
  details: '',
};

export default function LeadForm({ intent, title }: LeadFormProps) {
  const [form, setForm] = useState<LeadFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          intent,
        }),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setStatus('success');
      setForm(initialState);
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.leadForm} onSubmit={onSubmit}>
      <h2 className={styles.sectionTitle}>{title}</h2>

      <label className={styles.formField}>
        <span>Full name</span>
        <input
          type="text"
          required
          value={form.fullName}
          onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
        />
      </label>

      <label className={styles.formField}>
        <span>Work email</span>
        <input
          type="email"
          required
          value={form.workEmail}
          onChange={(event) => setForm((prev) => ({ ...prev, workEmail: event.target.value }))}
        />
      </label>

      <label className={styles.formField}>
        <span>Firm name</span>
        <input
          type="text"
          required
          value={form.firmName}
          onChange={(event) => setForm((prev) => ({ ...prev, firmName: event.target.value }))}
        />
      </label>

      <label className={styles.formField}>
        <span>Team size</span>
        <select
          required
          value={form.teamSize}
          onChange={(event) => setForm((prev) => ({ ...prev, teamSize: event.target.value }))}
        >
          <option value="">Select team size</option>
          <option value="1-5">1–5</option>
          <option value="6-20">6–20</option>
          <option value="21-50">21–50</option>
          <option value="51+">51+</option>
        </select>
      </label>

      <label className={styles.formField}>
        <span>What should we focus on?</span>
        <textarea
          rows={4}
          required
          value={form.details}
          onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
        />
      </label>

      <button className={styles.primaryBtn} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </button>

      {status === 'success' && (
        <p className={styles.successText}>Thanks. We received your request and will follow up shortly.</p>
      )}
      {status === 'error' && (
        <p className={styles.errorText}>Unable to submit right now. Please try again.</p>
      )}
    </form>
  );
}
