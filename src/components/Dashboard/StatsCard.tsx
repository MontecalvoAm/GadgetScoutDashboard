import React from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  gradient: string;
  delay: number;
}

export default function StatsCard({ title, value, icon, color, gradient, delay }: StatsCardProps) {
  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-2xl shadow-md`}>
          {icon}
        </div>
      </div>
      <div className={`h-1 bg-gradient-to-r ${color} rounded-full mt-4 opacity-75`}></div>
    </div>
  );
}