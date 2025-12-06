import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Appointment, Doctor, Patient } from '../types';

interface AdminViewProps {
  stats: {
    patientsCount: number;
    doctorsCount: number;
    appointmentsCount: number;
  };
  appointments: Appointment[];
}

const AdminView: React.FC<AdminViewProps> = ({ stats, appointments }) => {
  const data = [
    { name: 'Mon', patients: 40 },
    { name: 'Tue', patients: 30 },
    { name: 'Wed', patients: 20 },
    { name: 'Thu', patients: 27 },
    { name: 'Fri', patients: 18 },
    { name: 'Sat', patients: 23 },
    { name: 'Sun', patients: 34 },
  ];

  const revenueData = [
    { name: 'Mon', revenue: 120000 },
    { name: 'Tue', revenue: 95000 },
    { name: 'Wed', revenue: 88000 },
    { name: 'Thu', revenue: 105000 },
    { name: 'Fri', revenue: 76000 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Hospital Administration</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold">Total Patients</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.patientsCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-primary">
              <i className="fas fa-users text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-secondary">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold">Active Doctors</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.doctorsCount}</p>
            </div>
             <div className="p-3 bg-teal-50 rounded-full text-secondary">
              <i className="fas fa-user-md text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-accent">
           <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold">Appointments</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.appointmentsCount}</p>
            </div>
             <div className="p-3 bg-rose-50 rounded-full text-accent">
              <i className="fas fa-calendar-check text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Patient Flow (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f0f9ff'}} />
                <Bar dataKey="patients" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
           <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Trends</h3>
           <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} />
                 <YAxis axisLine={false} tickLine={false} />
                 <Tooltip formatter={(value) => `LKR ${value}`} />
                 <Line type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Recent Appointments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 5).map(appt => (
                <tr key={appt.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{appt.patientName}</td>
                  <td className="px-6 py-4">{appt.doctorName}</td>
                  <td className="px-6 py-4">{appt.date} {appt.time}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        appt.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        appt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {appt.status}
                      </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminView;