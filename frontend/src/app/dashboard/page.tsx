'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { isPast, parseISO } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        const tasks = res.data;
        
        let completed = 0;
        let pending = 0;
        let overdue = 0;

        tasks.forEach((task: any) => {
          if (task.status === 'DONE') completed++;
          if (task.status !== 'DONE') {
            pending++;
            if (task.dueDate && isPast(parseISO(task.dueDate))) {
              overdue++;
            }
          }
        });

        setStats({
          total: tasks.length,
          completed,
          pending,
          overdue
        });
      } catch (error: any) {
        console.error(error);
        // Silently fail or toast depending on preference, but let's log it
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Loading stats...</div>;
  }

  const statCards = [
    { name: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-sm text-gray-500 mt-1">Here is what's happening with your projects today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Could add recent tasks list here in the future */}
    </div>
  );
}
