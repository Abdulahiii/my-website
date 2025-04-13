'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Notification = {
  notification_id: number;
  message: string;
  timestamp: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardLink, setDashboardLink] = useState('/auth/login');

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();

    const storedRole = localStorage.getItem('role');
    if (storedRole === 'Group Admin') {
      setDashboardLink('/group_admin');
    } else if (storedRole === 'Team Member') {
      setDashboardLink('/team_member');
    }
  }, []);

  const handleClearNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to clear notifications');

      setNotifications([]);
    } catch (err) {
      console.error('Clear error:', err);
      alert('Failed to clear notifications.');
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow text-black">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>

        <div className="mb-4">
          <Link href={dashboardLink} className="text-blue-600 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : notifications.length === 0 ? (
          <p>No notifications available.</p>
        ) : (
          <>
            <ul className="space-y-2 border border-gray-300 rounded p-4 bg-white">
              {notifications.map((n) => (
                <li key={n.notification_id}>
                  <p className="font-medium">{n.message}</p>
                  <p className="text-sm text-gray-600">{n.timestamp}</p>
                </li>
              ))}
            </ul>
            <button
              onClick={handleClearNotifications}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear All Notifications
            </button>
          </>
        )}
      </div>
    </div>
  );
}
