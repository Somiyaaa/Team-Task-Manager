'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { CheckSquare, Trash2, Plus, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', projectId: '', dueDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      toast.success('Status updated');
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update task');
    }
  };

  const toggleTaskCompletion = (task: any) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    updateTaskStatus(task.id, newStatus);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/tasks', newTask);
      toast.success('Task created successfully');
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', projectId: '', dueDate: '' });
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse">Loading tasks...</div>;

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'ALL') return true;
    return task.status === filter;
  });

  return (
    <div className="min-h-screen bg-[#0f0f17] text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">All Tasks</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-400">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-white/10 rounded-md text-sm p-2 bg-[#0f0f17] text-white focus:ring-primary focus:border-primary"
            >
              <option value="ALL">All Status</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1 bg-primary text-white px-3 py-2 rounded-md hover:bg-primary-hover text-sm font-medium transition"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      <div className="bg-[#1f1f2e] rounded-2xl shadow-lg border border-white/5 overflow-hidden">
        {filteredTasks.length > 0 ? (
          <ul className="divide-y divide-white/5">
            {filteredTasks.map((task) => {
              const isOverdue =
              task.dueDate &&
              new Date(task.dueDate) < new Date() &&
              task.status !== "DONE";
              return (
              <li
              key={task.id}
              className={`p-4 flex items-center justify-between transition group hover:scale-[1.01]
                ${isOverdue ? "border-l-4 border-rose-500 bg-[#2a1f2f]" : "hover:bg-[#2a2a3d]"}`}
                >
                <div className="flex items-start">
                  <button 
                    onClick={() => toggleTaskCompletion(task)}
                    className="mt-1 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    title="Toggle Completion"
                  >
                    <CheckSquare className={`h-5 w-5 hover:text-primary transition ${task.status === 'DONE' ? 'text-emerald-500' : 'text-gray-300'}`} />
                  </button>
                  <div className="ml-3">
                    <h4 className={`text-sm font-medium ${task.status === 'DONE' ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</h4>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-400">
                      <span>Project: {task.project?.name}</span>
                      {task.assignedTo && <span>Assignee: {task.assignedTo.name}</span>}
                      {task.dueDate && (
                        <span>Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-4 flex items-center space-x-2">
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="text-xs border border-white/10 rounded p-1 bg-[#0f0f17] text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                  {(user?.role === 'ADMIN' || task.project?.createdById === user?.id) && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-gray-500 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No tasks yet 🚀 Create your first task!
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-4 md:p-5">
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-900">Title</label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary focus:ring-primary"
                    placeholder="Task title"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-900">Project</label>
                  {projects.length === 0 ? (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                      You need to create a project first before you can add tasks.{' '}
                      <a href="/dashboard/projects" className="font-semibold underline hover:text-yellow-900">
                        Go to Projects
                      </a>
                    </div>
                  ) : (
                    <select
                      required
                      value={newTask.projectId}
                      onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary focus:ring-primary"
                    >
                      <option value="" disabled>Select a project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-900">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary focus:ring-primary"
                    placeholder="Add any details..."
                  ></textarea>
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-900">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || projects.length === 0}
                className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
