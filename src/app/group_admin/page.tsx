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
  status: string;
  priority: string;
  deadline: string;
  owner: string; 
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
        console.error('Error fetching tasks:', error);
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
                  No tasks found.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.task_id} className="hover:bg-gray-100">
                  <td className="border border-gray-400 px-4 py-2 text-black">{task.title}</td>
                  <td className="border border-gray-400 px-4 py-2 text-black">{task.owner}</td>
                  <td className={`border border-gray-400 px-4 py-2 text-black ${statusColors[task.status]}`}>
                    {task.status}
                  </td>
                  <td className={`border border-gray-400 px-4 py-2 text-black ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </td>
                  <td className="border border-gray-400 px-4 py-2 text-black">{task.deadline}</td>
                  <td className="border border-gray-400 px-4 py-2 text-black text-xs">
                    {task.comments.length > 0 ? (
                      task.comments.map((c, i) => (
                        <div key={i} className="mb-1">
                          <p className="text-black">{c.content}</p>
                          <p className="text-gray-700 text-[10px]">
                            {new Date(c.timestamp).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false,
                            }).replace(',', '')}
                          </p>
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

        <div className="mt-6 space-y-2">
          <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add Task
          </button>
          <button className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            Assign Task
          </button>
        </div>
      </div>
    </div>
  );
}
