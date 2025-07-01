import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, TimeScale);

export default function AdminStats({ stats }) {
  if (!stats) return null;

  // Users by role
  const roleLabels = stats.usersByRole?.map(r => r.role) || [];
  const roleCounts = stats.usersByRole?.map(r => parseInt(r.count)) || [];

  // Daily active learners
  const dailyLabels = stats.dailyActive?.map(d => d.date) || [];
  const dailyCounts = stats.dailyActive?.map(d => parseInt(d.count)) || [];

  // Popular categories
  const categoryLabels = stats.categories?.map(c => c.category) || [];
  const categoryCounts = stats.categories?.map(c => parseInt(c.count)) || [];

  return (
    <div className="space-y-8 text-gray-900 dark:text-white">
      {/* Users by Role */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold mb-4">Users by Role</h4>
        <Pie
          data={{
            labels: roleLabels,
            datasets: [{
              data: roleCounts,
              backgroundColor: ['#3b82f6', '#a78bfa', '#f59e42', '#ef4444'],
            }]
          }}
          options={{
            plugins: { legend: { position: 'bottom' } }
          }}
        />
      </div>

      {/* Daily Active Learners */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 dark:text-white">
        <h4 className="text-lg font-semibold mb-4">Daily Active Learners (Last 30 Days)</h4>
        <Line
          data={{
            labels: dailyLabels,
            datasets: [{
              label: 'Active Learners',
              data: dailyCounts,
              fill: true,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59,130,246,0.1)',
              tension: 0.3
            }]
          }}
          options={{
            scales: {
              x: { type: 'time', time: { unit: 'day' } }
            }
          }}
        />
      </div>

      {/* Popular Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold mb-4">Popular Categories</h4>
        <Bar
          data={{
            labels: categoryLabels,
            datasets: [{
              label: 'Tracks',
              data: categoryCounts,
              backgroundColor: '#a78bfa'
            }]
          }}
          options={{
            indexAxis: 'y',
            plugins: { legend: { display: false } }
          }}
        />
      </div>
    </div>
  );
}
