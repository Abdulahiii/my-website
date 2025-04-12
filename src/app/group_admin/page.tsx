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
  user_id: number;
  comments: { content: string; timestamp: string }[];
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

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/group_admin');
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    }
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    setAddError('');
    try {
      const res = await fetch('/api/group_admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, user_id: Number(newTask.user_id) }),
      });
      const result = await res.json();
      
      if (!res.ok) {
        setAddError(result.message || 'Failed to add task');
        return;
      } 
      setTasks(prev => [...prev, result.task]);
      setNewTask({ title: '', description: '', deadline: '', priority: 'Medium', status: 'Pending', user_id: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Frontend error during task add:', error);
      setAddError('An error occurred while adding the task.');
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
    
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-black">Group Admin Dashboard</h2>

        <table className="min-w-full border-collapse border border-gray-400">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="border px-4 py-2 text-left">Task</th>
              <th className="border px-4 py-2 text-left">Owner</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Priority</th>
              <th className="border px-4 py-2 text-left">Deadline</th>
              <th className="border px-4 py-2 text-left">Comments</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.task_id} className="cursor-pointer hover:bg-gray-200" onClick={() => {
                setSelectedTaskId(task.task_id);
                setAssigning(false);
                setEditing(false);
              }}>
                <td className="border px-4 py-2 text-black">
                  <div>{task.title}</div>
                  <div className="text-xs text-gray-600">{task.description}</div>
                </td>
                <td className="border px-4 py-2 text-black">TM{String(task.user_id).padStart(2, '0')}</td>
                <td className={`border px-4 py-2 text-black ${statusColors[task.status]}`}>{task.status}</td>
                <td className={`border px-4 py-2 text-black ${priorityColors[task.priority]}`}>{task.priority}</td>
                <td className="border px-4 py-2 text-black">{task.deadline}</td>
                <td className="border px-4 py-2 text-black text-xs">
                  {task.comments.length ? (
                    task.comments.map((c, i) => (
                      <div key={i} className="mb-1">
                        <p>{c.content}</p>
                        <p className="text-gray-600 text-[10px]">{c.timestamp}</p>
                      </div>
                    ))
                  ) : <p className="italic text-gray-600">No comments</p>}
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
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleAddTask}>Submit Task</button>
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
