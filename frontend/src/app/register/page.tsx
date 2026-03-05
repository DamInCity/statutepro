'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { authApi, setAccessToken, setRefreshToken } from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      // Auto-login after successful registration
      if (response.tokens) {
        setAccessToken(response.tokens.access_token);
        setRefreshToken(response.tokens.refresh_token);
        router.push('/dashboard');
      } else {
        // If no tokens, redirect to login
        router.push('/login');
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>⚖️ StatutePro</h1>
          <p>Create your free account</p>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="John"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  size="lg"
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Doe"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  size="lg"
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="you@example.com"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              size="lg"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="At least 8 characters"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              size="lg"
            />
            <Form.Text className="text-muted">
              Must be at least 8 characters long
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4" controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Re-enter your password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              size="lg"
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            size="lg"
            className="w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Creating account...
              </>
            ) : (
              'Create free account'
            )}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <p className="text-muted small">
            Already have an account?{' '}
            <Link href="/login" className="text-primary text-decoration-none">
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-center mt-3">
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>
            By creating an account, you agree to our{' '}
            <Link href="/privacy" className="text-primary">Terms</Link> and{' '}
            <Link href="/privacy" className="text-primary">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
