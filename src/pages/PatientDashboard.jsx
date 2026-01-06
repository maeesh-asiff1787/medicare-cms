import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/MockDatabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, User, Activity, Plus, Save, Download, Printer, Stethoscope, Upload } from 'lucide-react';
import toast from 'react-hot-toast'; // NEW IMPORT

const PatientDashboard = () => {
  const { currentUser, appointments, doctors, addAppointment, logout, profiles, updateProfile, labReports, prescriptions, uploadLabReport } = useDatabase();
  const navigate = useNavigate();
  const userProfile = profiles[currentUser?.username] || {};

  const [activeTab, setActiveTab] = useState('appointments');
  const [doctor, setDoctor] = useState(doctors[0]?.name || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [labFile, setLabFile] = useState(null);
  const [labName, setLabName] = useState('');

  // Profile Form
  const [formData, setFormData] = useState({
    nid: userProfile.nid || '',
    age: userProfile.age || '',
    phone: userProfile.phone || '',
    dob: userProfile.dob || '',
    address: userProfile.address || '',
    insurance: userProfile.insurance || '',
    allergies: userProfile.allergies || ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        nid: userProfile.nid || '',
        age: userProfile.age || '',
        phone: userProfile.phone || '',
        dob: userProfile.dob || '',
        address: userProfile.address || '',
        insurance: userProfile.insurance || '',
        allergies: userProfile.allergies || ''
      });
    }
  }, [profiles, currentUser]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleBook = (e) => {
    e.preventDefault();
    addAppointment({ doctor, date, time, notes });
    toast.success("Appointment Request Sent!"); // TOAST
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    updateProfile(currentUser.username, { ...userProfile, ...formData });
    toast.success("Medical Profile Saved!"); // TOAST
  };

  const submitLab = (e) => {
    e.preventDefault();
    if(!labFile || !labName) return toast.error("Please select file and name."); // TOAST
    const reader = new FileReader();
    reader.onload = (ev) => {
      uploadLabReport(currentUser.name, labName, ev.target.result, 'patient');
      toast.success("Report Uploaded Successfully!"); // TOAST
      setLabName(''); setLabFile(null);
    }
    reader.readAsDataURL(labFile);
  };

  const myAppointments = appointments.filter(a => a.username === currentUser?.username);
  const myLabs = labReports.filter(l => l.patient === currentUser?.name);
  const myMeds = prescriptions.filter(p => p.patient === currentUser?.name);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar (Hidden during print) */}
      <nav className="bg-primary shadow-lg text-white px-6 py-4 flex justify-between items-center sticky top-0 z-20 print:hidden">
        <h1 className="text-xl font-bold flex items-center gap-2">🏥 MediCare Patient</h1>
        <button onClick={handleLogout}><LogOut size={18} /></button>
      </nav>

      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Tabs */}
        <div className="hidden md:flex gap-6 mb-8 border-b border-slate-200 pb-1 print:hidden">
           {['appointments', 'profile', 'labs', 'prescriptions'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 px-2 text-sm font-bold capitalize border-b-2 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}>{tab}</button>
          ))}
        </div>

        <div className="space-y-6">
          
          {/* APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="grid md:grid-cols-2 gap-6 print:hidden">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-lg font-bold mb-4">Book Visit</h2>
                <form onSubmit={handleBook} className="space-y-4">
                  <select className="w-full p-2 border rounded" value={doctor} onChange={e => setDoctor(e.target.value)}>
                    {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="w-full p-2 border rounded" value={date} onChange={e => setDate(e.target.value)} />
                    <input type="time" className="w-full p-2 border rounded" value={time} onChange={e => setTime(e.target.value)} />
                  </div>
                  <button className="w-full bg-primary text-white font-bold py-2 rounded">Confirm</button>
                </form>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-lg font-bold mb-4">My Schedule</h2>
                {myAppointments.map(app => (
                   <div key={app.id} className="p-3 mb-2 border rounded bg-slate-50">
                     <p className="font-bold text-sm">{app.doctor}</p>
                     <p className="text-xs">{app.date} @ {app.time}</p>
                   </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border max-w-2xl mx-auto print:hidden">
              <h2 className="text-xl font-bold mb-6">Personal Health Record</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">National ID</label>
                  <input type="text" className="w-full p-2 border rounded bg-slate-50 text-slate-500" value={formData.nid} disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                    <input type="number" placeholder="Age" className="w-full p-2 border rounded" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                    <input type="date" className="w-full p-2 border rounded" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                   <input type="text" className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                   <input type="text" placeholder="e.g. H. Sunshine, Malé" className="w-full p-2 border rounded" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Insurance</label>
                   <input type="text" placeholder="e.g. Aasandha / Allied" className="w-full p-2 border rounded" value={formData.insurance} onChange={e => setFormData({...formData, insurance: e.target.value})} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-red-500 uppercase mb-1">Allergies</label>
                   <textarea placeholder="e.g. Allergic to Penicillin..." className="w-full p-2 border rounded border-red-200 bg-red-50" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})}></textarea>
                </div>
                <button className="w-full bg-slate-800 text-white font-bold py-3 rounded">Save Profile</button>
              </form>
            </div>
          )}

          {/* LABS */}
          {activeTab === 'labs' && (
             <div className="grid md:grid-cols-2 gap-6 print:hidden">
                <div className="bg-white p-6 rounded-xl border">
                  <h2 className="font-bold mb-4">Upload Report</h2>
                  <input type="file" onChange={e => setLabFile(e.target.files[0])} className="mb-2 w-full text-sm"/>
                  <input type="text" placeholder="Test Name" className="w-full p-2 border rounded mb-2" value={labName} onChange={e => setLabName(e.target.value)} />
                  <button onClick={submitLab} className="w-full bg-orange-500 text-white font-bold py-2 rounded">Upload</button>
                </div>
                <div className="bg-white p-6 rounded-xl border">
                   <h2 className="font-bold mb-4">My Records</h2>
                   {myLabs.map(l => (
                     <div key={l.id} className="p-2 border-b flex justify-between text-sm">
                       <span>{l.testName}</span>
                       <a href={l.fileData} download={l.testName} className="text-blue-600"><Download size={16}/></a>
                     </div>
                   ))}
                </div>
             </div>
          )}

          {/* PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-8">
               {myMeds.length === 0 ? <p className="text-slate-400 text-center py-10">No prescriptions yet.</p> : (
                 <div className="grid gap-8">
                   {myMeds.map(med => (
                     <div key={med.id} className="bg-white p-8 border border-slate-300 shadow-lg max-w-3xl mx-auto w-full print:border-none print:shadow-none print:w-full">
                       
                       {/* Header */}
                       <div className="flex justify-between items-start border-b-4 border-green-600 pb-4 mb-6">
                         <div>
                             <h1 className="text-3xl font-serif font-bold text-slate-900">MediCare Clinic</h1>
                             <p className="text-sm text-slate-500">Malé, Republic of Maldives | +960 333-MEDIC</p>
                         </div>
                         <div className="text-right">
                           <p className="font-bold text-lg">Date: {med.date}</p>
                           <p className="text-xs text-slate-400">Rx #{med.id}</p>
                         </div>
                       </div>

                       {/* Patient Details */}
                       <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-8 bg-slate-50 p-4 border rounded print:bg-white print:border-slate-300">
                         <div className="flex justify-between border-b pb-1"><span>Patient Name:</span> <span className="font-bold">{currentUser.name}</span></div>
                         <div className="flex justify-between border-b pb-1"><span>National ID:</span> <span className="font-bold">{userProfile.nid || 'N/A'}</span></div>
                         <div className="flex justify-between border-b pb-1"><span>Date of Birth:</span> <span className="font-bold">{userProfile.dob || '--'}</span></div>
                         <div className="flex justify-between border-b pb-1"><span>Age / Sex:</span> <span className="font-bold">{userProfile.age || '--'} / {userProfile.sex || '--'}</span></div>
                         <div className="flex justify-between border-b pb-1"><span>Insurance:</span> <span className="font-bold">{userProfile.insurance || 'None'}</span></div>
                       </div>
                       
                       {/* Diagnosis */}
                       <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded print:bg-white print:border-slate-300">
                          <h3 className="text-sm font-bold text-slate-500 uppercase">Diagnosis</h3>
                          <p className="text-xl font-bold text-slate-800">{med.diagnosis || 'General Consultation'}</p>
                       </div>

                       {/* Medicines */}
                       <div className="mb-8">
                         <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4 flex items-center gap-2"><span className="text-green-600 text-4xl">Rx</span></h3>
                         <table className="w-full text-sm text-left border border-slate-300">
                           <thead className="bg-slate-100 text-slate-700 print:bg-slate-200">
                             <tr>
                               <th className="p-3 border-r">Medicine Name</th>
                               <th className="p-3 border-r w-32">Unit</th>
                               <th className="p-3">Dosage Instructions</th>
                             </tr>
                           </thead>
                           <tbody>
                             {med.medicines && med.medicines.map((item, idx) => (
                               <tr key={idx} className="border-t border-slate-200">
                                 <td className="p-3 border-r font-bold">{item.name}</td>
                                 <td className="p-3 border-r">{item.unit}</td>
                                 <td className="p-3">{item.dosage}</td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       </div>

                       {/* Signature */}
                       <div className="grid grid-cols-2 gap-12 mt-12 items-end">
                         <div className="text-sm">
                           <p className="font-bold mb-1">Doctor's Notes:</p>
                           <div className="p-2 border border-slate-200 rounded min-h-[60px] italic text-slate-600">{med.doctorNotes}</div>
                         </div>
                         <div className="text-center">
                           <div className="border-b border-slate-900 mb-2"></div>
                           <p className="font-bold text-lg">{med.doctor}</p>
                           <p className="text-xs uppercase tracking-widest text-slate-500">Authorized Signature</p>
                         </div>
                       </div>

                       <div className="mt-8 text-center print:hidden">
                         <button onClick={() => window.print()} className="bg-slate-800 text-white px-8 py-3 rounded-full hover:bg-black transition flex items-center gap-2 mx-auto shadow-lg">
                           <Download size={20}/> Download / Print (PDF)
                         </button>
                       </div>

                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;