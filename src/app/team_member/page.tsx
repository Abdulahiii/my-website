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
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    }

    fetchTasks();
  }, []);

  const handleStatusChange = async () => {
    if (selectedTaskForStatus !== null && newStatus) {
      await fetch(`/api/tasks/${selectedTaskForStatus}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === selectedTaskForStatus ? { ...task, status: newStatus } : task
        )
      );

      setNewStatus('');
      setSelectedTaskForStatus(null);
    }
  };

  const handleCommentChange = async () => {
    if (selectedTaskForComment !== null && newComment) {
      await fetch(`/api/tasks/${selectedTaskForComment}/comment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: newComment }),
      });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === selectedTaskForComment ? { ...task, comment: newComment } : task
        )
      );

      setNewComment('');
      setSelectedTaskForComment(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-400';
      case 'Medium':
        return 'bg-amber-400';
      case 'Low':
        return 'bg-yellow-300';
      default:
        return 'bg-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-red-400';
      case 'In Progress':
        return 'bg-amber-400';
      case 'Completed':
        return 'bg-green-400';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-black">Team Member Dashboard</h2>

        {/* Tasks Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-400">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="border border-gray-400 px-4 py-2 text-left font-medium">Title</th>
                <th className="border border-gray-400 px-4 py-2 text-left font-medium">Priority</th>
                <th className="border border-gray-400 px-4 py-2 text-left font-medium">Status</th>
                <th className="border border-gray-400 px-4 py-2 text-left font-medium">Deadline</th>
                <th className="border border-gray-400 px-4 py-2 text-left font-medium">Comment</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-gray-400 px-4 py-2 text-center text-black">
                    No tasks assigned.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="border border-gray-400 px-4 py-2 text-black">{task.title}</td>
                    <td
                      className={`border border-gray-400 px-4 py-2 text-black ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </td>
                    <td
                      className={`border border-gray-400 px-4 py-2 text-black ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </td>
                    <td className="border border-gray-400 px-4 py-2 text-black">{task.deadline}</td>
                    <td className="border border-gray-400 px-4 py-2 text-black">
                      {task.comment || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {/* Update Status */}
          <div>
            <select
              value={selectedTaskForStatus || ''}
              onChange={(e) => setSelectedTaskForStatus(Number(e.target.value))}
              className="border border-gray-400 p-2 rounded w-full text-black"
            >
              <option value="">Select Task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="border border-gray-400 p-2 rounded w-full mt-2 text-black"
              disabled={!selectedTaskForStatus}
            >
              <option value="">Select New Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <button
              onClick={handleStatusChange}
              className={`mt-2 bg-blue-500 text-white px-4 py-2 rounded w-full ${
                !selectedTaskForStatus || !newStatus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
              }`}
              disabled={!selectedTaskForStatus || !newStatus}
            >
              Update Status
            </button>
          </div>

          {/* Add Comment */}
          <div>
            <select
              value={selectedTaskForComment || ''}
              onChange={(e) => setSelectedTaskForComment(Number(e.target.value))}
              className="border border-gray-400 p-2 rounded w-full text-black"
            >
              <option value="">Select Task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="border border-gray-400 p-2 rounded w-full mt-2 text-black"
              placeholder="Enter comment"
              disabled={!selectedTaskForComment}
            />

            <button
              onClick={handleCommentChange}
              className={`mt-2 bg-green-500 text-white px-4 py-2 rounded w-full ${
                !selectedTaskForComment || !newComment
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-green-600'
              }`}
              disabled={!selectedTaskForComment || !newComment}
            >
              Add Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
