import React, { useState } from 'react';
import { useDatabase } from '../context/MockDatabase';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, CheckCircle, DollarSign, LogOut, Plus, Trash2, UserMinus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { getStats, appointments, updateStatus, deleteAppointment, addDoctor, logout, doctors, deleteDoctor } = useDatabase();
  const navigate = useNavigate();
  const stats = getStats();

  const [newDocName, setNewDocName] = useState('');
  const [newDocSpec, setNewDocSpec] = useState('');

  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!newDocName || !newDocSpec) return toast.error("Please fill all fields");
    addDoctor(newDocName, newDocSpec);
    toast.success("Doctor added successfully!");
    setNewDocName('');
    setNewDocSpec('');
  };

  // Chart Data
  const data = [
    { name: 'Mon', visits: 4 },
    { name: 'Tue', visits: 7 },
    { name: 'Wed', visits: 3 },
    { name: 'Thu', visits: 8 },
    { name: 'Fri', visits: 5 },
    { name: 'Sat', visits: 6 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           🏥 MediCare <span className="text-sm font-normal text-slate-500">| Admin Portal</span>
        </h1>
        <button onClick={logout} className="text-slate-500 hover:text-red-500 flex gap-2 items-center">
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={24}/></div>
            <div><p className="text-slate-500 text-sm">Total Patients</p><h3 className="text-2xl font-bold text-slate-800">{stats.total}</h3></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Calendar size={24}/></div>
            <div><p className="text-slate-500 text-sm">Pending</p><h3 className="text-2xl font-bold text-slate-800">{stats.pending}</h3></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600"><CheckCircle size={24}/></div>
            <div><p className="text-slate-500 text-sm">Completed</p><h3 className="text-2xl font-bold text-slate-800">{stats.completed}</h3></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full text-purple-600"><DollarSign size={24}/></div>
            <div><p className="text-slate-500 text-sm">Revenue</p><h3 className="text-2xl font-bold text-slate-800">${stats.revenue}</h3></div>
          </div>
        </div>

        {/* --- DOCTOR MANAGEMENT SECTION (UPDATED) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* 1. Add Doctor Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus size={20} className="text-blue-600"/> Hire New Doctor</h2>
                <form onSubmit={handleAddDoctor} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Doctor Name</label>
                        <input type="text" className="w-full p-2 border rounded mt-1" placeholder="e.g. Dr. Aishath" value={newDocName} onChange={e => setNewDocName(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Specialty</label>
                        <input type="text" className="w-full p-2 border rounded mt-1" placeholder="e.g. Neurology" value={newDocSpec} onChange={e => setNewDocSpec(e.target.value)} />
                    </div>
                    <button className="w-full bg-slate-800 text-white font-bold py-2 rounded hover:bg-black transition">Add to System</button>
                </form>
            </div>

            {/* 2. Doctor List (NEW) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={20} className="text-blue-600"/> Active Medical Staff ({doctors.length})</h2>
                <div className="overflow-y-auto max-h-60">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase sticky top-0">
                            <tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Specialty</th><th className="p-3 text-right">Action</th></tr>
                        </thead>
                        <tbody className="text-sm">
                            {doctors.map(doc => (
                                <tr key={doc.id} className="border-b hover:bg-slate-50">
                                    <td className="p-3 font-mono text-slate-400">#{doc.id}</td>
                                    <td className="p-3 font-bold text-slate-700">{doc.name}</td>
                                    <td className="p-3 text-slate-500"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">{doc.specialty}</span></td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => deleteDoctor(doc.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50" title="Remove Doctor">
                                            <UserMinus size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* APPOINTMENT TABLE */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Appointment Requests</h2>
              <input type="text" placeholder="Search patient..." className="p-2 border rounded text-sm w-48"/>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-slate-500 text-sm"><th className="p-2">Patient</th><th className="p-2">Doctor</th><th className="p-2">Date & Time</th><th className="p-2">Status</th><th className="p-2 text-right">Actions</th></tr>
                </thead>
                <tbody>
                  {appointments.map(app => (
                    <tr key={app.id} className="border-b hover:bg-slate-50 text-sm">
                      <td className="p-2 font-medium">{app.patient}</td>
                      <td className="p-2 text-slate-500">{app.doctor}</td>
                      <td className="p-2 text-slate-500">{app.date} at {app.time}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${app.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <button onClick={() => deleteAppointment(app.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CHART */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Weekly Visits</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="visits" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-800 font-bold">✨ Insight</p>
              <p className="text-xs text-blue-600 mt-1">Thursday is your busiest day. Consider adding more staff.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;