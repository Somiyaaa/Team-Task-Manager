'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { Plus, Users, CheckSquare, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      toast.success('Project created');
      setShowCreate(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this project? All tasks will be deleted.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete project');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading projects...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      {showCreate && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                rows={3}
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer h-full flex flex-col relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                {(user?.role === 'ADMIN' || project.createdById === user?.id) && (
                  <button
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Delete Project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 border-t pt-4">
                <div className="flex items-center">
                  <CheckSquare className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>{project._count?.tasks || 0} tasks</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>{project._count?.members || 0} members</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && !showCreate && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
            No projects found. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
}
