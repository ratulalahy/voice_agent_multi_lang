/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';

interface DashboardStats {
  activeAgents: number;
  totalConversations: number;
  pendingAppointments: number;
  onlineVisitors: number;
}

interface RecentActivity {
  id: string;
  type: 'conversation' | 'appointment' | 'inquiry';
  client: string;
  time: string;
  status: 'active' | 'completed' | 'pending';
}

export default function Dashboard() {
  const [stats] = useState<DashboardStats>({
    activeAgents: 3,
    totalConversations: 24,
    pendingAppointments: 7,
    onlineVisitors: 12
  });

  const [recentActivity] = useState<RecentActivity[]>([
    { id: '1', type: 'conversation', client: 'Sarah Johnson', time: '2 min ago', status: 'active' },
    { id: '2', type: 'appointment', client: 'Mike Chen', time: '15 min ago', status: 'pending' },
    { id: '3', type: 'inquiry', client: 'Emma Wilson', time: '23 min ago', status: 'completed' },
    { id: '4', type: 'conversation', client: 'David Rodriguez', time: '1 hour ago', status: 'completed' },
  ]);

  return (
    <div className="dashboard-sidebar">
      <div className="dashboard-header">
        <h2>🏠 DataMindLabs Hub</h2>
        <p>AI Agent Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-info">
            <span className="stat-number">{stats.activeAgents}</span>
            <span className="stat-label">Active Agents</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalConversations}</span>
            <span className="stat-label">Conversations</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-number">{stats.pendingAppointments}</span>
            <span className="stat-label">Appointments</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-number">{stats.onlineVisitors}</span>
            <span className="stat-label">Online Visitors</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {activity.type === 'conversation' && '💬'}
                {activity.type === 'appointment' && '📅'}
                {activity.type === 'inquiry' && '📋'}
              </div>
              <div className="activity-details">
                <div className="activity-client">{activity.client}</div>
                <div className="activity-meta">
                  <span className="activity-type">{activity.type}</span>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
              <div className={`activity-status ${activity.status}`}>
                {activity.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary">
            <span className="btn-icon">📞</span>
            Transfer Call
          </button>
          <button className="action-btn secondary">
            <span className="btn-icon">📝</span>
            View Notes
          </button>
          <button className="action-btn secondary">
            <span className="btn-icon">📊</span>
            Analytics
          </button>
          <button className="action-btn secondary">
            <span className="btn-icon">⚙️</span>
            Settings
          </button>
        </div>
      </div>

      {/* Agent Status */}
      <div className="agent-status">
        <h3>Agent Status</h3>
        <div className="agent-list">
          <div className="agent-item">
            <div className="agent-avatar">🏠</div>
            <div className="agent-info">
              <div className="agent-name">Property Expert</div>
              <div className="agent-status-indicator online">Online</div>
            </div>
          </div>
          <div className="agent-item">
            <div className="agent-avatar">🏢</div>
            <div className="agent-info">
              <div className="agent-name">Commercial Specialist</div>
              <div className="agent-status-indicator busy">Busy</div>
            </div>
          </div>
          <div className="agent-item">
            <div className="agent-avatar">🏘️</div>
            <div className="agent-info">
              <div className="agent-name">Rental Assistant</div>
              <div className="agent-status-indicator online">Online</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
