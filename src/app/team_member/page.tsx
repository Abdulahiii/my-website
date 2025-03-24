'use client';

import { useEffect, useState } from 'react';

type Task = {
  id: number;
  title: string;
  status: string;
  comment: string;
  deadline: string;
  priority: string;
};

export default function TeamMemberDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskForStatus, setSelectedTaskForStatus] = useState<number | null>(null);
  const [selectedTaskForComment, setSelectedTaskForComment] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/tasks');
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchTasks();
  }, []);

  const handleStatusChange = async () => {
    if (selectedTaskForStatus !== null && newStatus) {
      try {
        const res = await fetch(`/api/tasks/${selectedTaskForStatus}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error('Failed to update status');

        setTasks((prev) =>
          prev.map((task) =>
            task.id === selectedTaskForStatus ? { ...task, status: newStatus } : task
          )
        );
      } catch (error) {
        console.error(error);
      }
      setNewStatus('');
      setSelectedTaskForStatus(null);
    }
  };

  const handleCommentChange = async () => {
    if (selectedTaskForComment !== null && newComment) {
      try {
        const res = await fetch(`/api/tasks/${selectedTaskForComment}/comment`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment: newComment }),
        });
        if (!res.ok) throw new Error('Failed to update comment');

        setTasks((prev) =>
          prev.map((task) =>
            task.id === selectedTaskForComment ? { ...task, comment: newComment } : task
          )
        );
      } catch (error) {
        console.error(error);
      }
      setNewComment('');
      setSelectedTaskForComment(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-black">Team Member Dashboard</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-400">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="border border-gray-400 px-4 py-2 text-left font-medium">Title</th>
                <th className="border border-gray-400 px-4 py-2 text-left font-medium">Priority</th>
                <th className="border border-gray-400 px-4 py-2 text-left font-medium">Status</th>
                <th className="border border-gray-400 px-4 py-2 text-left font-medium">Deadline</th>
                <th className="border border-gray-400 px-4 py-2 text-left font-medium">Comment</th>
                <th className="border border-gray-400 px-4 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-gray-400 px-4 py-2 text-center text-black">
                    No tasks assigned.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="border border-gray-400 px-4 py-2 text-black">{task.title}</td>
                    <td className="border border-gray-400 px-4 py-2 text-black">{task.priority}</td>
                    <td className="border border-gray-400 px-4 py-2 text-black">{task.status}</td>
                    <td className="border border-gray-400 px-4 py-2 text-black">{task.deadline}</td>
                    <td className="border border-gray-400 px-4 py-2 text-black">{task.comment || '—'}</td>
                    <td className="border border-gray-400 px-4 py-2">
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                        onClick={() => setSelectedTaskForStatus(task.id)}
                      >
                        Update Status
                      </button>
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => setSelectedTaskForComment(task.id)}
                      >
                        Add Comment
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedTaskForStatus !== null && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter new status"
              className="border p-2 mr-2"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            />
            <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleStatusChange}>
              Save
            </button>
          </div>
        )}

        {selectedTaskForComment !== null && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter new comment"
              className="border p-2 mr-2"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleCommentChange}>
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
