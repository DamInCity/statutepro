'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner, Alert, InputGroup, Modal } from 'react-bootstrap';
import { FiRefreshCw, FiDollarSign, FiArrowRight, FiPlus } from 'react-icons/fi';
import { currencyApi, Currency, CurrencyConversionResult } from '@/lib/api';

export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Converter state
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState<string>('100');
  const [converting, setConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<CurrencyConversionResult | null>(null);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const data = await currencyApi.list(false);
      setCurrencies(data);
      setError(null);
    } catch (err) {
      setError('Failed to load currencies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleConvert = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    
    try {
      setConverting(true);
      const result = await currencyApi.convert(
        fromCurrency,
        toCurrency,
        parseFloat(amount)
      );
      setConversionResult(result);
    } catch (err) {
      console.error(err);
      setConversionResult(null);
    } finally {
      setConverting(false);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setConversionResult(null);
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Currency Management</h1>
          <p className="text-muted mb-0">Manage currencies and exchange rates</p>
        </div>
        <Button variant="primary">
          <FiPlus className="me-2" /> Add Currency
        </Button>
      </div>

      <Row className="g-4">
        {/* Currency Converter */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FiDollarSign /> Currency Converter
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-3">
                <Form.Group>
                  <Form.Label className="small text-muted">Amount</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setConversionResult(null);
                      }}
                      placeholder="Enter amount"
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group>
                  <Form.Label className="small text-muted">From</Form.Label>
                  <Form.Select
                    value={fromCurrency}
                    onChange={(e) => {
                      setFromCurrency(e.target.value);
                      setConversionResult(null);
                    }}
                  >
                    {currencies.filter(c => c.is_active).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <div className="text-center">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={swapCurrencies}
                    className="rounded-circle"
                  >
                    ↕️
                  </Button>
                </div>

                <Form.Group>
                  <Form.Label className="small text-muted">To</Form.Label>
                  <Form.Select
                    value={toCurrency}
                    onChange={(e) => {
                      setToCurrency(e.target.value);
                      setConversionResult(null);
                    }}
                  >
                    {currencies.filter(c => c.is_active).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Button
                  variant="primary"
                  onClick={handleConvert}
                  disabled={converting || !amount}
                >
                  {converting ? (
                    <Spinner size="sm" />
                  ) : (
                    <>Convert <FiArrowRight className="ms-2" /></>
                  )}
                </Button>

                {conversionResult && (
                  <Card bg="light" className="border-0">
                    <Card.Body className="text-center py-4">
                      <div className="text-muted small mb-1">
                        {conversionResult.formatted_original}
                      </div>
                      <div className="h3 mb-1 text-primary">
                        {conversionResult.formatted_converted}
                      </div>
                      <div className="small text-muted">
                        1 {conversionResult.from_currency} = {conversionResult.exchange_rate.toFixed(4)} {conversionResult.to_currency}
                      </div>
                      <div className="small text-muted mt-1">
                        Rate date: {conversionResult.rate_date}
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Currencies List */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">All Currencies</h5>
              <Button variant="outline-primary" size="sm" onClick={fetchCurrencies}>
                <FiRefreshCw className="me-1" /> Refresh
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : error ? (
                <Alert variant="danger" className="m-3">{error}</Alert>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Symbol</th>
                      <th>Format</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currencies.map((currency) => (
                      <tr key={currency.code}>
                        <td>
                          <Badge bg="dark" className="text-uppercase">
                            {currency.code}
                          </Badge>
                          {currency.is_base_currency && (
                            <Badge bg="primary" className="ms-1">Base</Badge>
                          )}
                        </td>
                        <td>{currency.name}</td>
                        <td className="fw-bold">{currency.symbol}</td>
                        <td className="small text-muted">
                          {currency.symbol_position === 'before' ? currency.symbol : ''}
                          1{currency.thousands_separator}000{currency.decimal_separator}
                          {'0'.repeat(currency.decimal_places)}
                          {currency.symbol_position === 'after' ? ` ${currency.symbol}` : ''}
                        </td>
                        <td>
                          <Badge bg={currency.is_active ? 'success' : 'secondary'}>
                            {currency.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline-secondary" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
