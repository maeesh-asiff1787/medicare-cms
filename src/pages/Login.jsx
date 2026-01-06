import React, { useState } from 'react';
import { useDatabase } from '../context/MockDatabase';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Lock, Stethoscope } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useDatabase();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // --- 🚨 EMERGENCY VIVA OVERRIDE ---
    // Forces login even if database is empty/glitched
    if (username.toLowerCase() === 'doctor' && password === '123') {
      navigate('/doctor');
      return;
    }
    if (username.toLowerCase() === 'admin' && password === '123') {
      navigate('/admin');
      return;
    }
    // ----------------------------------

    const result = login(username, password);
    if (result.success) {
      if (result.role === 'admin') navigate('/admin');
      else if (result.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-primary">
        <div className="text-center mb-8">
          <div className="bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">MediCare Portal</h1>
          <p className="text-slate-500">Secure Clinic Management System</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="admin, doctor, or patient"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="123"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Login to System
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Demo Credentials (Password: 123)</p>
          <div className="flex justify-center gap-4 mt-2 mb-4">
            <span className="font-mono bg-slate-100 px-2 rounded">admin</span>
            <span className="font-mono bg-slate-100 px-2 rounded">doctor</span>
            <span className="font-mono bg-slate-100 px-2 rounded">patient</span>
          </div>
          
          {/* NEW REGISTER LINK */}
          <div className="border-t pt-4">
             <p className="text-sm text-slate-600">New Patient?</p>
             <a href="/register" className="text-primary font-bold hover:underline">Create a Digital Health Record</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;