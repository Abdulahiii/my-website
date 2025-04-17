'use client';
import Link from 'next/link';
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
  user_id: number;
  tasklist_id: number;
  comments: { content: string; timestamp: string }[];
};

export default function TeamMemberDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newComment, setNewComment] = useState('');
  const [taskList, setTaskList] = useState<{ tasklist_id: number; name: string }[]>([]);
  const [selectedtasklistId, setselectedtasklistId] = useState<number | null>(null);
  const [fullName, setFullName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [showAssignedOnly, setShowAssignedOnly] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('fullName');
    const storedId = localStorage.getItem('user_id');
    if (storedName) setFullName(storedName);
    if (storedId) setUserId(Number(storedId));
  }, []);

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

    async function fetchTaskLists() {
      try {
        const res = await fetch('/api/tasklists');
        if (!res.ok) throw new Error('Failed to fetch task lists');
        const data = await res.json();
        setTaskList(data);
        if (data.length > 0) {
          setselectedtasklistId(data[0].tasklist_id);
        }
      } catch (error) {
        console.error('Task list fetch error:', error);
      }
    }

    fetchTasks();
    fetchTaskLists();
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

  const filteredTasks = tasks.filter(task => {
    const matchesList = task.tasklist_id === selectedtasklistId;
    const matchesUser = !showAssignedOnly || task.user_id === userId;
    return matchesList && matchesUser;
  });

  return (
    <div className="relative min-h-screen bg-gray-100 p-8">
      <div className="absolute top-4 left-4 z-50">
        <a href="/login">
          <img src="/home.png" alt="Home" className="w-5 h-5 hover:opacity-80" />
        </a>
      </div>
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-black">Team Member Dashboard</h2>
        <h1 className="text-xl font-bold mb-4 text-black">Hello {fullName} US#{String(userId).padStart(2, '0')}</h1>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/notifications" className="text-blue-600 hover:underline text-sm">
            View Notifications
          </Link>

          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="border px-4 py-2 rounded text-black"
              value={selectedtasklistId || ''}
              onChange={(e) => setselectedtasklistId(Number(e.target.value))}
            >
              {taskList.map((list) => (
                <option key={list.tasklist_id} value={list.tasklist_id}>
                  {list.name}
                </option>
              ))}
            </select>

            <button
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              onClick={() => setShowAssignedOnly(prev => !prev)}
            >
              {showAssignedOnly ? 'Show All Tasks' : 'Tasks Assigned to You'}
            </button>
          </div>
        </div>

        <table className="min-w-full border-collapse border border-gray-400">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Title</th>
              <th className="border px-4 py-2 text-left">Priority</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Deadline</th>
              <th className="border px-4 py-2 text-left">Comments</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="border px-4 py-2 text-center text-black">
                  No tasks assigned.
                </td>
              </tr>
            ) : (
              filteredTasks.map(task => (
                <tr
                  key={task.task_id}
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => handleTaskSelect(task)}
                >
                  <td className="border px-4 py-2 text-black font-mono">#{task.task_id}</td>
                  <td className="border px-4 py-2 text-black">
                    <div>{task.title}</div>
                    <div className="text-xs text-gray-600">{task.description}</div>
                  </td>
                  <td className={`border px-4 py-2 text-black ${priorityColors[task.priority]}`}>{task.priority}</td>
                  <td className={`border px-4 py-2 text-black ${statusColors[task.status]}`}>{task.status}</td>
                  <td className="border px-4 py-2 text-black">{task.deadline}</td>
                  <td className="border px-4 py-2 text-black text-xs">
                    {task.comments.length > 0 ? (
                      task.comments.map((c, i) => (
                        <div key={i} className="mb-1">
                          <p>{c.content}</p>
                          <p className="text-gray-600 text-[10px]">{c.timestamp}</p>
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
