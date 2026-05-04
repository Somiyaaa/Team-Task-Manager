'use client';

import React, { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Plus, Users, UserPlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedToId: '', dueDate: '' });
  const [memberId, setMemberId] = useState('');

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        ...newTask,
        projectId: id,
        assignedToId: newTask.assignedToId || undefined,
        dueDate: newTask.dueDate || undefined
      });
      toast.success('Task created');
      setShowTaskForm(false);
      setNewTask({ title: '', description: '', assignedToId: '', dueDate: '' });
      fetchProject(); // refresh project tasks
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create task');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { userId: memberId });
      toast.success('Member added');
      setShowMemberForm(false);
      setMemberId('');
      fetchProject();
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      toast.success('Task status updated');
      fetchProject();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProject();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete task');
    }
  };

  if (loading) return <div className="animate-pulse">Loading project...</div>;
  if (!project) return <div>Project not found</div>;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
        <p className="text-gray-600 mb-4">{project.description}</p>
        
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <span className="font-medium mr-2 text-gray-700">Created By:</span>
            {project.createdBy?.name}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span className="font-medium mr-2 text-gray-700">Members:</span>
            {project.members?.map((m: any) => m.name).join(', ')}
          </div>
        </div>

        <div className="mt-6 flex space-x-4 border-t pt-4">
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover text-sm"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Task
            </button>
            <button
              onClick={() => setShowMemberForm(!showMemberForm)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              <UserPlus className="h-4 w-4 mr-2" /> Add Member
            </button>
          </div>
      </div>

      {showMemberForm && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Add Member by ID</h2>
          <form onSubmit={handleAddMember} className="flex space-x-4">
            <input
              type="text"
              required
              placeholder="User ID (UUID)"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">
              Add
            </button>
          </form>
        </div>
      )}

      {showTaskForm && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
          <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assign To</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 bg-white"
                value={newTask.assignedToId}
                onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {project.members.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                rows={2}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowTaskForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover">
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban-like task display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
          <div key={status} className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
              {status.replace('_', ' ')}
              <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                {project.tasks.filter((t: any) => t.status === status).length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {project.tasks.filter((t: any) => t.status === status).map((task: any) => (
                <div key={task.id} className="bg-white p-4 rounded shadow-sm border border-gray-200">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  {task.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
                  
                  <div className="mt-4 flex items-center justify-between">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="text-xs border rounded p-1 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                    
                    {task.dueDate && (
                      <span className="text-xs text-gray-400">
                        {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                  {(isAdmin || project.createdById === user?.id) && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete Task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
