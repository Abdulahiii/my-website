'use client';

import { useEffect, useState } from 'react';

type Task = {
  task_id: number;
  title: string;
  status: string;
  deadline: string;
  priority: string;
  user_id: number;
  comments: { content: string; timestamp: string }[];
};

export default function GroupAdminDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState('');

  const [newTask, setNewTask] = useState({
    title: '',
    deadline: '',
    priority: '',
    status: '',
    user_id: '',
  });

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-amber-500';
      case 'Low':
        return 'bg-yellow-500';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-red-500';
      case 'In Progress':
        return 'bg-amber-500';
      case 'Completed':
        return 'bg-green-500';
      default:
        return '';
    }
  };

  const handleAddTask = async () => {
    setAddError('');

    try {
      const res = await fetch('/api/group_admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      const result = await res.json();

      if (!res.ok) {
        setAddError(result.message || 'Failed to add task.');
        return;
      }

      setTasks(prev => [...prev, result]);
      setShowAddForm(false);
      setNewTask({
        title: '',
        deadline: '',
        priority: '',
        status: '',
        user_id: '',
      });
    } catch (error) {
      console.error('Add Task error:', error);
      setAddError('Something went wrong. Try again.');
    }
  };

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
                <td colSpan={6} className="text-center text-black py-4">No tasks available.</td>
              </tr>
            ) : (
              tasks.map(task => (
                <tr key={task.task_id}>
                  <td className="border border-gray-400 px-4 py-2 text-black">{task.title}</td>
                  <td className="border border-gray-400 px-4 py-2 text-black">TM{String(task.user_id).padStart(2, '0')}</td>
                  <td className={`border border-gray-400 px-4 py-2 text-black ${getStatusColor(task.status)}`}>{task.status}</td>
                  <td className={`border border-gray-400 px-4 py-2 text-black ${getPriorityColor(task.priority)}`}>{task.priority}</td>
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
                      <p className="text-gray-500 italic">No comments</p>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-6">
          <button
            onClick={() => setShowAddForm(prev => !prev)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showAddForm ? 'Cancel Add Task' : 'Add Task'}
          </button>

          {showAddForm && (
            <div className="mt-4 bg-gray-100 p-4 rounded shadow">
              <input
                type="text"
                placeholder="Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="border p-2 w-full mt-2 rounded text-black"
              />
              <input
                type="date"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                className="border p-2 w-full mt-2 rounded text-black"
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="border p-2 w-full mt-2 rounded text-black"
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                className="border p-2 w-full mt-2 rounded text-black"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <input
                type="number"
                placeholder="User ID (e.g., 1, 2)"
                value={newTask.user_id}
                onChange={(e) => setNewTask({ ...newTask, user_id: e.target.value })}
                className="border p-2 w-full mt-2 rounded text-black"
              />
              <button
                onClick={handleAddTask}
                className="bg-green-600 text-white px-4 py-2 rounded w-full mt-2"
              >
                Confirm Add Task
              </button>
              {addError && (
                <p className="text-red-500 mt-2 text-sm">{addError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
