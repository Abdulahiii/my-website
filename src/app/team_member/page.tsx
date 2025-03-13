'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Task = {
  id: number;
  title: string;
  status: string;
  comment: string;
};

export default function TeamMemberDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const router = useRouter();

  // Fetch tasks from the database
  useEffect(() => {
    async function fetchTasks() {
      const res = await fetch('/api/tasks'); // API route to get tasks
      const data = await res.json();
      setTasks(data);
      const initialComments = data.reduce((acc: any, task: Task) => {
        acc[task.id] = task.comment || '';
        return acc;
      }, {});
      setComments(initialComments);
    }

    fetchTasks();
  }, []);

  // Handle task status update
  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
  };

  // Handle comment update
  const handleCommentChange = (id: number, comment: string) => {
    setComments((prev) => ({
      ...prev,
      [id]: comment,
    }));
  };

  const saveComment = async (id: number) => {
    await fetch(`/api/tasks/${id}/comment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: comments[id] }),
    });

    alert('Comment saved!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Team Member Dashboard</h2>
        
        {tasks.length === 0 ? (
          <p>No tasks assigned.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="border-b py-4">
              <h3 className="text-lg font-semibold">{task.title}</h3>

              {/* Status dropdown */}
              <select
                value={task.status}
                onChange={(e) =>
                  handleStatusChange(task.id, e.target.value)
                }
                className="border p-2 mt-2 rounded w-full"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              {/* Comment box */}
              <textarea
                value={comments[task.id]}
                onChange={(e) =>
                  handleCommentChange(task.id, e.target.value)
                }
                className="border p-2 mt-2 rounded w-full"
                placeholder="Add a comment..."
              ></textarea>
              <button
                onClick={() => saveComment(task.id)}
                className="bg-blue-500 text-white mt-2 px-4 py-2 rounded hover:bg-blue-600"
              >
                Save Comment
              </button>
            </div>
          ))
        )}

        {/* Notification Button */}
        <button
          onClick={() => router.push('/dashboard/notifications')}
          className="mt-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Go to Notifications
        </button>
      </div>
    </div>
  );
}
