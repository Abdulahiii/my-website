'use client';

import { useEffect, useState } from 'react';

const statusColors: { [key: string]: string } = {
  'Pending': 'bg-red-500',
  'In Progress': 'bg-amber-500',
  'Completed': 'bg-green-500',
};

const priorityColors: { [key: string]: string } = {
  'High': 'bg-red-500',
  'Medium': 'bg-amber-500',
  'Low': 'bg-yellow-500',
};

type Task = {
  task_id: number;
  title: string;
  description: string;
  status: string;
  deadline: string;
  priority: string;
  comments: { content: string; timestamp: string }[];
};

export default function TeamMemberDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newComment, setNewComment] = useState('');

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

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setNewComment('');
  };

  const handleUpdate = async () => {
    if (!selectedTask) return;
    try {
      const res = await fetch(`/api/tasks/${selectedTask.task_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, comment: newComment }),
      });
      if (!res.ok) throw new Error('Failed to update task');

      // Update frontend state
      const updatedTasks = tasks.map(task =>
        task.task_id === selectedTask.task_id
          ? {
              ...task,
              status: newStatus,
              comments: newComment
                ? [...task.comments, { content: newComment, timestamp: new Date().toISOString() }]
                : task.comments,
            }
          : task
      );
      setTasks(updatedTasks);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error during update:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-black">Team Member Dashboard</h2>
        <table className="min-w-full border-collapse border border-gray-400">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="border border-gray-400 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Title</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Priority</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Deadline</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Comments</th>
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
              tasks.map(task => (
                <tr
                  key={task.task_id}
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => handleTaskSelect(task)}
                >
                  <td className="border px-4 py-2 text-black font-mono">#{task.task_id}</td>
                  <td className="border border-gray-400 px-4 py-2 text-black">
                    <div>{task.title}</div>
                  <div className="text-xs text-gray-600">{task.description}</div>
                  </td>
                  <td className={`border border-gray-400 px-4 py-2 text-black ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </td>
                  <td className={`border border-gray-400 px-4 py-2 text-black ${statusColors[task.status]}`}>
                    {task.status}
                  </td>
                  <td className="border border-gray-400 px-4 py-2 text-black">{task.deadline}</td>
                  <td className="border border-gray-400 px-4 py-2 text-black text-xs">
                    {task.comments.length > 0 ? (
                      task.comments.map((c, i) => (
                        <div key={i} className="mb-1">
                          <p className="text-black">{c.content}</p>
                          <p className="text-gray-700 text-[10px]">{c.timestamp}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 italic">No comments</p>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {selectedTask && (
          <div className="mt-6 p-4 bg-gray-200 rounded-lg">
            <h3 className="text-lg font-bold mb-2 text-black">Update Task</h3>
            <select
              className="border rounded p-2 w-full bg-white text-black"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <input
              type="text"
              className="border rounded p-2 w-full mt-2 bg-white text-black"
              placeholder="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <button
              onClick={handleUpdate}
              className="bg-green-500 text-white px-4 py-2 rounded mt-2 w-full"
            >
              Confirm Update
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
