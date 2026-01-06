import React, { useState } from 'react';
import { useDatabase } from '../context/MockDatabase';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast'; // Ensure this package is installed

const Register = () => {
  const { registerPatient } = useDatabase();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '', nid: '', age: '', sex: 'Male', phone: '', password: '', confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Validation Checks with Toasts
    if (formData.password !== formData.confirmPassword) {
        return toast.error("Passwords do not match!");
    }
    if (!formData.fullName || !formData.nid || !formData.phone) {
        return toast.error("Please fill all required fields");
    }

    // Call Database
    const result = registerPatient(formData.fullName, formData.nid, formData.age, formData.sex, formData.phone, formData.password);
    
    if (result.success) {
      toast.success("Registration Successful! Please Login.");
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-green-500">
        <div className="text-center mb-6">
          <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Patient Registration</h1>
          <p className="text-slate-500 text-sm">Create your digital health record</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
            <input name="fullName" type="text" onChange={handleChange} className="w-full p-2 border rounded" placeholder="e.g. Ahmed Ali" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">NID (National ID)</label>
              <input name="nid" type="text" onChange={handleChange} className="w-full p-2 border rounded" placeholder="AXXXXXX" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
              <input name="phone" type="text" onChange={handleChange} className="w-full p-2 border rounded" placeholder="777..." required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Age</label>
              <input name="age" type="number" onChange={handleChange} className="w-full p-2 border rounded" placeholder="25" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Sex</label>
              <select name="sex" onChange={handleChange} className="w-full p-2 border rounded">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              <input name="password" type="password" onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Confirm</label>
              <input name="confirmPassword" type="password" onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition shadow-md">
            Create Account
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-primary hover:underline">Already have an account? Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;