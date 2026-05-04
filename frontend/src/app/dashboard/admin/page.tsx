'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Users, FolderKanban, CheckSquare, BarChart } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/projects')
        ]);
        setStats(statsRes.data);
        setProjects(projectsRes.data);
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.error || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'ADMIN') {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="animate-pulse">Loading admin dashboard...</div>;

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <BarChart className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500">You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Hub</h1>
        <p className="text-gray-500">System-wide overview and project tracking</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
              <FolderKanban className="h-5 w-5 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
              <CheckSquare className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Completed Tasks</h3>
              <CheckSquare className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
          </div>
        </div>
      )}

      {/* Projects Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">All Platform Projects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      {project.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">{project.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.createdBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        {project.memberCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {project.completedTasks}/{project.totalTasks} ({project.progress}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(project.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No projects exist on the platform yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
