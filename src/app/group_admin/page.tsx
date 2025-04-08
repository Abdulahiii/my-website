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
  priority: string;
  status: string;
  deadline: string;
  owner_id: number;
  comments: { content: string; timestamp: string }[];
};

export default function GroupAdminDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/group_admin');
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-black">Group Admin Dashboard</h2>
        <table className="min-w-full border-collapse border border-gray-400">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="border border-gray-400 px-4 py-2 text-left">Task</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Owner</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Priority</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Deadline</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Comments</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="border border-gray-400 px-4 py-2 text-center text-black">
                  No tasks available.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.task_id} className="hover:bg-gray-100">
                  <td className="border border-gray-400 px-4 py-2 text-black">{task.title}</td>
                  <td className="border border-gray-400 px-4 py-2 text-black">{`TM${task.owner_id.toString().padStart(2, '0')}`}</td>
                  <td className={`border border-gray-400 px-4 py-2 text-black ${statusColors[task.status]}`}>{task.status}</td>
                  <td className={`border border-gray-400 px-4 py-2 text-black ${priorityColors[task.priority]}`}>{task.priority}</td>
                  <td className="border border-gray-400 px-4 py-2 text-black">{task.deadline}</td>
                  <td className="border border-gray-400 px-4 py-2 text-black text-xs">
                    {task.comments.length > 0 ? (
                      task.comments.map((c, i) => (
                        <div key={i} className="mb-1">
                          <p>{c.content}</p>
                          <p className="text-[10px] text-gray-700">{c.timestamp}</p>
                        </div>
                      ))
                    ) : (
                      <p className="italic text-gray-600">No comments</p>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Task
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Assign Task
          </button>
        </div>
      </div>
    </div>
  );
}
