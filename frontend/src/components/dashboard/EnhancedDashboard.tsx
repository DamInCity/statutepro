'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { 
  FiBriefcase, FiUsers, FiFileText, FiDollarSign, 
  FiTrendingUp, FiClock, FiAlertCircle, FiActivity 
} from 'react-icons/fi';
import Link from 'next/link';
import { analyticsApi, tasksApi, mattersApi } from '@/lib/api';
import './EnhancedDashboard.css';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}

function StatCard({ title, value, subtitle, icon, gradient, delay = 0 }: StatCardProps) {
  return (
    <motion.div 
      className="enhanced-stat-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="stat-icon-wrapper" style={{ background: gradient }}>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="stat-content">
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
      <div className="stat-glow" style={{ background: gradient }}></div>
    </motion.div>
  );
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function EnhancedDashboard() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const headerY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.7]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.dashboard,
  });

  const { data: myTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'my'],
    queryFn: () => tasksApi.myTasks({ per_page: 5 }),
  });

  const { data: recentMatters, isLoading: mattersLoading } = useQuery({
    queryKey: ['matters', 'recent'],
    queryFn: () => mattersApi.list({ per_page: 5, status: 'active' }),
  });

  const isLoading = analyticsLoading || tasksLoading || mattersLoading;

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const overview = analytics?.overview;
  const revenue = analytics?.revenue;
  const billable = analytics?.billable_hours;

  return (
    <div className="enhanced-dashboard">
      {/* Animated Background Pattern */}
      <div className="dashboard-bg-pattern"></div>

      {/* Header Section with Parallax */}
      <motion.div 
        ref={heroRef}
        className="dashboard-header"
        style={{ y: headerY, opacity: headerOpacity }}
      >
        <div className="header-content">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="dashboard-title">
              Welcome back! <span className="gradient-text">Here's your firm today.</span>
            </h1>
            <p className="dashboard-subtitle">Real-time metrics, matters, and team activity.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/dashboard/tasks" className="btn-primary">
              <FiAlertCircle /> View All Tasks
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid - 2x2 Layout */}
      <section className="stats-section">
        <div className="stats-grid-enhanced">
          <StatCard
            title="Active Matters"
            value={overview?.active_matters || 0}
            subtitle={`${overview?.total_matters || 0} total`}
            icon={<FiBriefcase />}
            gradient="linear-gradient(135deg, #2f6ef2 0%, #1f53c4 100%)"
            delay={0}
          />
          <StatCard
            title="Active Clients"
            value={overview?.active_clients || 0}
            subtitle={`${overview?.total_clients || 0} total`}
            icon={<FiUsers />}
            gradient="linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
            delay={0.1}
          />
          <StatCard
            title="Outstanding"
            value={formatCurrency(revenue?.outstanding || 0)}
            subtitle={`${formatCurrency(revenue?.overdue || 0)} overdue`}
            icon={<FiFileText />}
            gradient="linear-gradient(135deg, #d97706 0%, #c2410c 100%)"
            delay={0.2}
          />
          <StatCard
            title="This Month"
            value={formatCurrency(revenue?.total_collected || 0)}
            subtitle={`${((revenue?.collection_rate || 0) * 100).toFixed(0)}% collection rate`}
            icon={<FiDollarSign />}
            gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
            delay={0.3}
          />
        </div>
      </section>

      {/* 3-Column Layout for Analytics */}
      <section className="analytics-section">
        <Row className="g-4">
          {/* Billable Hours - Full Width on Mobile, 1/3 on Desktop */}
          <Col lg={4}>
            <motion.div 
              className="analytics-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="card-header-enhanced">
                <div className="card-icon">
                  <FiClock />
                </div>
                <h3>Billable Hours</h3>
              </div>
              <div className="card-body-enhanced">
                <div className="metrics-row">
                  <div className="metric-item">
                    <div className="metric-label">Total Hours</div>
                    <div className="metric-value">{(billable?.total_hours || 0).toFixed(1)}</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">Billable</div>
                    <div className="metric-value success">{(billable?.billable_hours || 0).toFixed(1)}</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">Utilization</div>
                    <div className="metric-value primary">{((billable?.utilization_rate || 0) * 100).toFixed(0)}%</div>
                  </div>
                </div>
                <div className="progress-bar-enhanced">
                  <motion.div 
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(billable?.utilization_rate || 0) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          </Col>

          {/* Revenue */}
          <Col lg={4}>
            <motion.div 
              className="analytics-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="card-header-enhanced">
                <div className="card-icon success">
                  <FiTrendingUp />
                </div>
                <h3>Revenue</h3>
              </div>
              <div className="card-body-enhanced">
                <div className="metrics-row">
                  <div className="metric-item">
                    <div className="metric-label">Billed</div>
                    <div className="metric-value">{formatCurrency(revenue?.total_billed || 0)}</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">Collected</div>
                    <div className="metric-value success">{formatCurrency(revenue?.total_collected || 0)}</div>
                  </div>
                </div>
                <div className="metric-item mt-3">
                  <div className="metric-label">Average invoice</div>
                  <div className="metric-value-sm">{formatCurrency(revenue?.average_invoice_amount || 0)}</div>
                </div>
              </div>
            </motion.div>
          </Col>

          {/* Tasks */}
          <Col lg={4}>
            <motion.div 
              className="analytics-card tasks-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="card-header-enhanced">
                <div className="card-icon warning">
                  <FiAlertCircle />
                </div>
                <h3>My Tasks</h3>
                <Link href="/dashboard/tasks" className="view-all-link">View all</Link>
              </div>
              <div className="card-body-enhanced tasks-list">
                {myTasks?.tasks?.length ? (
                  myTasks.tasks.slice(0, 3).map((task, i) => (
                    <motion.div
                      key={task.id}
                      className="task-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                    >
                      <div className="task-content">
                        <div className="task-title">{task.title}</div>
                        <div className="task-matter">{task.matter?.name || 'No matter'}</div>
                      </div>
                      <div className={`task-badge ${task.is_overdue ? 'danger' : task.priority}`}>
                        {task.is_overdue ? 'Overdue' : task.priority}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="empty-state">No tasks assigned</div>
                )}
              </div>
            </motion.div>
          </Col>
        </Row>
      </section>

      {/* Recent Matters - Full Width with Pattern */}
      <section className="matters-section">
        <motion.div 
          className="matters-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="card-header-enhanced">
            <div className="card-icon">
              <FiActivity />
            </div>
            <h3>Recent Active Matters</h3>
            <Link href="/dashboard/matters" className="btn-ghost-sm">View All</Link>
          </div>
          <div className="matters-table-wrapper">
            <table className="enhanced-table">
              <thead>
                <tr>
                  <th>Matter</th>
                  <th>Client</th>
                  <th>Practice Area</th>
                  <th>Status</th>
                  <th>Opened</th>
                </tr>
              </thead>
              <tbody>
                {recentMatters?.matters?.length ? (
                  recentMatters.matters.map((matter, i) => (
                    <motion.tr
                      key={matter.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <td>
                        <Link href={`/dashboard/matters/${matter.id}`} className="matter-link">
                          <div className="matter-number">{matter.matter_number}</div>
                          <div className="matter-name">{matter.name}</div>
                        </Link>
                      </td>
                      <td>{matter.client?.name || 'N/A'}</td>
                      <td className="text-capitalize">{matter.practice_area?.replace('_', ' ')}</td>
                      <td>
                        <span className={`status-badge ${matter.status}`}>
                          {matter.status}
                        </span>
                      </td>
                      <td>{new Date(matter.open_date).toLocaleDateString()}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-state">No active matters found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
