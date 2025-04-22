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

type TaskList = {
  tasklist_id: number;
  name: string;
};

export default function GroupAdminDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'Medium',
    status: 'Pending',
    user_id: '',
  });
  const [addError, setAddError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    deadline: '',
  });
  const [editError, setEditError] = useState('');
  const [taskLists, setTaskLists] = useState<{ tasklist_id: number; name: string }[]>([]);
  const [selectedTaskListId, setSelectedTaskListId] = useState<number | null>(null);
  const [showTaskListForm, setShowTaskListForm] = useState(false);
  const [newTaskListName, setNewTaskListName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('user_id');
    if (storedId) {
      setUserId(Number(storedId));
    }
  }, []);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [tasksRes, taskListsRes] = await Promise.all([
          fetch('/api/group_admin'),
          fetch('/api/tasklists')
        ]);

        const [tasksData, taskListsData] = await Promise.all([
          tasksRes.json(),
          taskListsRes.json()
        ]);

        setTasks(tasksData);
        setTaskLists(taskListsData);
        if (taskListsData.length > 0) setSelectedTaskListId(taskListsData[0].tasklist_id);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    }

    fetchInitialData();
  }, []);

  const handleAddTask = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setAddError('');

    if (!selectedTaskListId) {
      setAddError('Please select a task list before adding a task.');
      return;
    }

    try {
      const res = await fetch('/api/group_admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, user_id: Number(newTask.user_id), tasklist_id: selectedTaskListId }),
      });
      const result = await res.json();

      if (!res.ok) {
        setAddError(result.message || 'Failed to add task');
        return;
      }
      if (!tasks.some(t => t.task_id == result.task.task_id)) {
        setTasks(prev => [...prev, result.task]);
      }
      setNewTask({ title: '', description: '', deadline: '', priority: 'Medium', status: 'Pending', user_id: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Frontend error during task add:', error);
      setAddError('An error occurred while adding the task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedTaskId) return;
    setAssignError('');
    try {
      const res = await fetch('/api/group_admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: selectedTaskId, user_id: Number(assignUserId) }),
      });
      const result = await res.json();
      if (!res.ok) return setAssignError(result.message);
      setTasks(prev => prev.map(t => t.task_id === selectedTaskId ? { ...t, user_id: Number(assignUserId) } : t));
      setAssigning(false);
      setAssignUserId('');
    } catch {
      setAssignError('Assignment failed');
    }
  };

  const handleEditClick = () => {
    const task = tasks.find(t => t.task_id === selectedTaskId);
    if (task) {
      setEditTask({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline,
      });
      setEditing(true);
    }
  };

  const handleConfirmEdit = async () => {
    if (!selectedTaskId) return;
    try {
      const res = await fetch(`/api/group_admin/${selectedTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTask),
      });
      const result = await res.json();
      if (!res.ok) return setEditError(result.message);
      setTasks(prev => prev.map(task => task.task_id === selectedTaskId ? { ...task, ...editTask } : task));
      setEditing(false);
    } catch {
      setEditError('Edit failed');
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTaskId) return;
    const confirm = window.confirm('Are you sure you want to delete this task?');
    if (!confirm) return;

    try {
      const res = await fetch(`/api/group_admin/${selectedTaskId}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!res.ok) {
        console.error('Delete error:', result);
        throw new Error('Failed to delete task');
      }

      setTasks(prev => prev.filter(task => task.task_id !== selectedTaskId));
      setSelectedTaskId(null);
    } catch (error) {
      alert('Delete failed');
      console.error('Delete task error:', error);
    }
  };

  const handleCreateTaskList = async () => {
    if (!userId || !newTaskListName.trim()) return;

    try {
      const res = await fetch('/api/tasklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTaskListName.trim(),
          user_id: userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to create task list');
        return;
      }

      setTaskLists(prev => [...prev, data]);
      setShowTaskListForm(false);
      setNewTaskListName('');
      setSelectedTaskListId(data.tasklist_id);

    } catch (error) {
      console.error('Task list creation failed:', error);
      alert('Something went wrong.');
    }
  };

  const [fullName, setFullName] = useState('');
  useEffect(() => {
    const storedName = localStorage.getItem('fullName');
    if (storedName) {
      setFullName(storedName);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-100 p-8">
      <div className="absolute top-4 left-4 z-50">
        <a href="/login">
          <img src="/home.png" alt="Home" className="w-5 h-5 hover:opacity-80" />
        </a>
      </div>
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2 text-black">Group Admin Dashboard</h2>
        <h1 className="text-xl font-bold mb-4 text-black">Hello {fullName} US#{String(userId).padStart(2, '0')}</h1>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/notifications" className="text-blue-600 hover:underline text-sm">
            View Notifications
          </Link>

          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedTaskListId || ''}
              onChange={(e) => setSelectedTaskListId(Number(e.target.value))}
              className="border px-4 py-2 rounded text-black"
            >
              {taskLists.map(list => (
                <option key={list.tasklist_id} value={list.tasklist_id}>
                  {list.name}
                </option>
              ))}
            </select>

            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              onClick={() => setShowTaskListForm(prev => !prev)}
            >
              {showTaskListForm ? 'Cancel Create Task List' : 'Create Task List'}
            </button>
          </div>
        </div>

        {showTaskListForm && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="New Task List Name"
              value={newTaskListName}
              onChange={(e) => setNewTaskListName(e.target.value)}
              className="border px-4 py-2 rounded text-black flex-1"
            />
            <button
              onClick={handleCreateTaskList}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create
            </button>
          </div>
        )}
        <table className="min-w-full border-collapse border border-gray-400">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Task</th>
              <th className="border px-4 py-2 text-left">Owner</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Priority</th>
              <th className="border px-4 py-2 text-left">Deadline</th>
              <th className="border px-4 py-2 text-left">Comments</th>
            </tr>
          </thead>
          <tbody>
            {tasks
              .filter(task => task.tasklist_id === selectedTaskListId)
              .map(task => (
                <tr
                  key={task.task_id}
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => {
                    setSelectedTaskId(task.task_id);
                    setAssigning(false);
                    setEditing(false);
                  }}
                >
                  <td className="border px-4 py-2 text-black font-mono">#{task.task_id}</td>
                  <td className="border px-4 py-2 text-black">
                    <div>{task.title}</div>
                    <div className="text-xs text-gray-600">{task.description}</div>
                  </td>
                  <td className="border px-4 py-2 text-black">
                    US#{String(task.user_id).padStart(2, '0')}
                  </td>
                  <td className={`border px-4 py-2 text-black ${statusColors[task.status]}`}>
                    {task.status}
                  </td>
                  <td className={`border px-4 py-2 text-black ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </td>
                  <td className="border px-4 py-2 text-black">{task.deadline}</td>
                  <td className="border px-4 py-2 text-black text-xs">
                    {task.comments.length ? (
                      task.comments.map((c, i) => (
                        <div key={i} className="mb-1">
                          <p>{c.content}</p>
                          <p className="text-gray-600 text-[10px]">
                            {new Date(c.timestamp).toLocaleString('en-GB', {
                              timeZone: 'Europe/London',
                              hour12: false,
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="italic text-gray-600">No comments</p>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="mt-6">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowAddForm(prev => !prev)}
          >
            {showAddForm ? 'Cancel Add Task' : 'Add Task'}
          </button>
        </div>
        {showAddForm && (
          <div className="mt-4 grid grid-cols-1 gap-2 bg-gray-100 p-4 rounded">
            <input type="text" placeholder="Title" className="border p-2 rounded text-black" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
            <input type="text" placeholder="Description" className="border p-2 rounded text-black" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
            <input type="date" className="border p-2 rounded text-black" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
            <select className="border p-2 rounded text-black" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select className="border p-2 rounded text-black" value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <input type="number" placeholder="User ID" className="border p-2 rounded text-black" value={newTask.user_id} onChange={e => setNewTask({ ...newTask, user_id: e.target.value })} />
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={handleAddTask}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Task'}
            </button>
            {addError && <p className="text-red-500 text-sm">{addError}</p>}
          </div>
        )}
        {selectedTaskId && (
          <div className="mt-6 bg-gray-100 p-4 rounded shadow space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <button onClick={() => setAssigning(prev => !prev)} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full">
                {assigning ? 'Cancel' : 'Assign Task'}
              </button>
              <button onClick={handleEditClick} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full">
                {editing ? 'Cancel Edit' : 'Edit Task'}
              </button>
              <button onClick={handleDeleteTask} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full">
                Delete Task
              </button>
            </div>

            {assigning && (
              <div>
                <input type="number" placeholder="Enter User ID to assign" value={assignUserId} onChange={e => setAssignUserId(e.target.value)} className="border p-2 rounded w-full text-black mt-2" />
                <button className="bg-green-600 text-white px-4 py-2 mt-2 rounded w-full" onClick={handleAssignTask}>Confirm Assignment</button>
                {assignError && <p className="text-red-500 text-sm">{assignError}</p>}
              </div>
            )}

            {editing && (
              <div className="grid grid-cols-1 gap-2">
                <input type="text" className="border p-2 rounded text-black" value={editTask.title} onChange={e => setEditTask({ ...editTask, title: e.target.value })} />
                <input type="text" className="border p-2 rounded text-black" value={editTask.description} onChange={e => setEditTask({ ...editTask, description: e.target.value })} />
                <input type="date" className="border p-2 rounded text-black" value={editTask.deadline} onChange={e => setEditTask({ ...editTask, deadline: e.target.value })} />
                <select className="border p-2 rounded text-black" value={editTask.priority} onChange={e => setEditTask({ ...editTask, priority: e.target.value })}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <select className="border p-2 rounded text-black" value={editTask.status} onChange={e => setEditTask({ ...editTask, status: e.target.value })}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleConfirmEdit}>Confirm Edit</button>
                {editError && <p className="text-red-500 text-sm">{editError}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}