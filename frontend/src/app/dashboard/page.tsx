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
    return <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"> {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#1f1f2e] rounded-2xl p-6 animate-pulse h-24" />
      ))}
      </div>;
  }

  const statCards = [
    { name: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f17]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}!</h1>
        <p className="text-sm text-gray-400 mt-1">Here is what's happening with your tasks today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className={`bg-[#1f1f2e] text-white rounded-2xl p-5 shadow-lg border border-white/5 hover:scale-105 transition duration-200 
            ${stat.name === "Overdue" && stat.value > 0 ? "border-rose-500/40" : ""}`}
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-xl p-3 ${stat.bg} shadow-md`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                  </div>
                 <div className="ml-5 flex-1 space-y-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">{stat.name}</dt>
                      <dd>
                        <div className={`text-3xl font-bold ${
                          stat.name === "Overdue" && stat.value > 0
                          ? "text-rose-400"
                          : "text-blue-400"
                          }`}>
                            {stat.value}
                            </div>
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
