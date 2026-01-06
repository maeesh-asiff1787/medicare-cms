import React, { useState } from 'react';
import { useDatabase } from '../context/MockDatabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Clipboard, FilePlus, FileText, Upload, Plus, Trash2, CheckCircle, Search, User, Printer, Users, X, Stethoscope, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { currentUser, appointments, profiles, labReports, addPrescription, uploadLabReport, logout, updateStatus, prescriptions, users } = useDatabase();
  const navigate = useNavigate();
  
  // TABS: 'schedule', 'records', 'patients'
  const [activeView, setActiveView] = useState('schedule'); 

  // --- PRESCRIPTION STATE ---
  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', unit: 'Tablet', dosage: '' }]);

  // --- RECORDS SEARCH STATE ---
  const [searchNid, setSearchNid] = useState('');
  const [foundPatient, setFoundPatient] = useState(null);

  // --- PRINT MODAL STATE ---
  const [printData, setPrintData] = useState(null); 

  // LAB UPLOAD STATE
  const [uploadMode, setUploadMode] = useState(false);
  const [labFile, setLabFile] = useState(null);
  const [labName, setLabName] = useState('');

  // DATA HELPERS
  const mySchedule = appointments.filter(app => app.doctor === currentUser.name).sort((a, b) => (a.status === 'Pending' ? -1 : 1));
  const myPatients = [...new Set(mySchedule.map(app => app.patient))];
  const allPatientsList = users.filter(u => u.role === 'patient'); 

  // --- HANDLERS ---
  const handleAddRow = () => setMedicines([...medicines, { name: '', unit: 'Tablet', dosage: '' }]);
  const handleRemoveRow = (index) => { const list = [...medicines]; list.splice(index, 1); setMedicines(list); };
  const handleMedicineChange = (index, field, value) => { const list = [...medicines]; list[index][field] = value; setMedicines(list); };

  const handlePrescribe = (e) => {
    e.preventDefault();
    if(!selectedPatient || !diagnosis) return toast.error("Patient and Diagnosis required.");
    const validMeds = medicines.filter(m => m.name.trim() !== '');
    if(validMeds.length === 0) return toast.error("Add at least one medicine.");

    addPrescription({ patient: selectedPatient, diagnosis, medicines: validMeds, doctorNotes });
    toast.success("Prescription Sent to Patient!");
    setDiagnosis(''); setDoctorNotes(''); setMedicines([{ name: '', unit: 'Tablet', dosage: '' }]);
  };

  const handleLabUpload = (e) => {
    e.preventDefault();
    if(!selectedPatient || !labFile || !labName) return toast.error("Missing upload details");
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadLabReport(selectedPatient, labName, event.target.result, 'doctor');
      toast.success("Lab Report Uploaded!");
    };
    reader.readAsDataURL(labFile);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === searchNid && u.role === 'patient');
    if (user) {
        const profile = profiles[user.username] || {};
        const history = prescriptions.filter(p => p.patient === user.name);
        setFoundPatient({ ...user, profile, history });
    } else {
   setFoundPatient(null);
   toast.error("Patient not found with this NID.");
}
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-slate-200 print:hidden">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           👨‍⚕️ Dr. Portal <span className="text-sm font-normal text-slate-500">| {currentUser?.name}</span>
        </h1>
        <div className="flex gap-6">
            <button onClick={() => setActiveView('schedule')} className={`text-sm font-bold ${activeView === 'schedule' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>My Schedule</button>
            <button onClick={() => setActiveView('patients')} className={`text-sm font-bold ${activeView === 'patients' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>All Patients</button>
            <button onClick={() => setActiveView('records')} className={`text-sm font-bold ${activeView === 'records' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Search History</button>
            <div className="w-px bg-slate-300 mx-2"></div>
            <button onClick={logout} className="text-slate-500 hover:text-red-500 flex gap-2 items-center text-sm">
            <LogOut size={16} /> Logout
            </button>
        </div>
      </nav>

      {/* --- PRINT MODAL --- */}
      {printData && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:absolute print:inset-0">
          <div className="bg-white p-8 max-w-3xl w-full rounded-xl shadow-2xl relative print:shadow-none print:w-full print:max-w-none print:rounded-none">
            <button onClick={() => setPrintData(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-600 print:hidden"><X size={24}/></button>
            
            {/* Header */}
            <div className="flex justify-between items-start border-b-4 border-green-600 pb-4 mb-6">
                 <div>
                     <h1 className="text-3xl font-serif font-bold text-slate-900">MediCare Clinic</h1>
                     <p className="text-sm text-slate-500">Malé, Republic of Maldives | +960 333-MEDIC</p>
                 </div>
                 <div className="text-right">
                   <p className="font-bold text-lg">Date: {printData.date}</p>
                   <p className="text-xs text-slate-400">Rx #{printData.id.toString().slice(-6)}</p>
                 </div>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6 bg-slate-50 p-4 border rounded print:bg-white print:border-slate-300">
                 <div className="flex justify-between border-b pb-1"><span>Patient Name:</span> <span className="font-bold">{printData.patient}</span></div>
                 <div className="flex justify-between border-b pb-1"><span>National ID:</span> <span className="font-bold">{printData.profile?.nid || 'N/A'}</span></div>
                 <div className="flex justify-between border-b pb-1"><span>Date of Birth:</span> <span className="font-bold">{printData.profile?.dob || '--'}</span></div>
                 <div className="flex justify-between border-b pb-1"><span>Age / Sex:</span> <span className="font-bold">{printData.profile?.age || '--'} / {printData.profile?.sex || '--'}</span></div>
                 <div className="flex justify-between border-b pb-1"><span>Insurance:</span> <span className="font-bold">{printData.profile?.insurance || 'None'}</span></div>
            </div>
            
            {/* Diagnosis */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded print:bg-white print:border-slate-300">
                 <h3 className="text-sm font-bold text-slate-500 uppercase">Diagnosis</h3>
                 <p className="text-xl font-bold text-slate-800">{printData.diagnosis || 'General Consultation'}</p>
            </div>

            {/* Medicines */}
            <div className="mb-8">
               <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4 flex items-center gap-2"><span className="text-green-600 text-4xl">Rx</span></h3>
               <table className="w-full text-sm text-left border border-slate-300">
                  <thead className="bg-slate-100 text-slate-700 print:bg-slate-200">
                    <tr><th className="p-3 border-r">Medicine Name</th><th className="p-3 border-r w-32">Unit</th><th className="p-3">Dosage Instructions</th></tr>
                  </thead>
                  <tbody>
                    {printData.medicines.map((m, i) => (
                      <tr key={i} className="border-t border-slate-200"><td className="p-3 border-r font-bold">{m.name}</td><td className="p-3 border-r">{m.unit}</td><td className="p-3">{m.dosage}</td></tr>
                    ))}
                  </tbody>
               </table>
            </div>

            {/* Signature */}
            <div className="grid grid-cols-2 gap-12 mt-12 items-end">
               <div className="text-sm"><p className="font-bold mb-1">Doctor's Notes:</p><div className="p-2 border border-slate-200 rounded min-h-[60px] italic text-slate-600">{printData.doctorNotes}</div></div>
               <div className="text-center"><div className="border-b border-slate-900 mb-2"></div><p className="font-bold">{printData.doctor}</p><p className="text-xs uppercase tracking-widest text-slate-500">Authorized Signature</p></div>
            </div>

            <div className="mt-8 text-center print:hidden">
               <button onClick={() => window.print()} className="bg-slate-800 text-white px-8 py-3 rounded-full hover:bg-black flex items-center gap-2 mx-auto shadow-lg">
                 <Printer size={20}/> Print Prescription
               </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DASHBOARD --- */}
      <div className="max-w-6xl mx-auto p-4 md:p-6 print:hidden">
        
        {/* VIEW 1: SCHEDULE */}
        {activeView === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* UPDATED LEFT CARD: Added shadow-md and border-slate-200 */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Calendar className="text-blue-500" /> Today's Schedule</h2>
              {mySchedule.length === 0 ? <p className="text-slate-400 italic">No appointments.</p> : (
                <div className="space-y-3">
                  {mySchedule.map(app => {
                    const patientProfile = profiles[app.username] || {};
                    return (
                      <div key={app.id} className={`p-4 border rounded-lg transition shadow-sm ${app.status === 'Completed' ? 'bg-slate-50 opacity-70' : 'bg-white border-blue-100 hover:shadow-md'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-slate-800 text-lg">{app.patient}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-2">
                              {patientProfile.age && <span className="bg-slate-100 px-2 py-0.5 rounded">{patientProfile.age} Yrs</span>}
                              {patientProfile.insurance && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">🏥 {patientProfile.insurance}</span>}
                              {patientProfile.allergies && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">⚠️ Allergy: {patientProfile.allergies}</span>}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${app.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{app.status}</span>
                        </div>
                        <p className="text-sm text-slate-600 italic border-l-2 border-slate-300 pl-2 mt-2">"{app.notes}"</p>
                        <div className="flex gap-2 mt-3">
                            <button onClick={() => {
                                const pLabs = labReports.filter(l => l.patient === app.patient);
                                if(pLabs.length === 0) alert("No lab reports found.");
                                else alert(`Files found:\n${pLabs.map(l => `- ${l.testName}`).join('\n')}`);
                            }} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"><FileText size={14}/> Check Labs</button>
                            {app.status !== 'Completed' && <button onClick={() => updateStatus(app.id, 'Completed')} className="text-xs bg-green-600 text-white font-bold px-2 py-1 rounded hover:bg-green-700 flex items-center gap-1"><CheckCircle size={14} /> Finish Visit</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* UPDATED RIGHT CARD: Added shadow-md and border-slate-200 */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 h-fit">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">{uploadMode ? <Upload className="text-orange-500"/> : <Clipboard className="text-green-500" />} {uploadMode ? 'Upload Lab' : 'Issue Prescription'}</h2>
                <button onClick={() => setUploadMode(!uploadMode)} className="text-xs bg-slate-800 text-white px-3 py-1 rounded">{uploadMode ? 'Switch to Rx' : 'Switch to Upload'}</button>
              </div>
              {!uploadMode ? (
                <form onSubmit={handlePrescribe} className="space-y-4">
                  <select className="w-full p-2 border rounded bg-white" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                    <option value="">-- Choose Patient --</option>
                    {myPatients.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input type="text" className="w-full p-2 border rounded" placeholder="Diagnosis (e.g. Flu)" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">Medicines <button type="button" onClick={handleAddRow} className="text-green-600 flex items-center gap-1"><Plus size={14}/> Add</button></label>
                    {medicines.map((med, index) => (
                      <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded border">
                        <input type="text" placeholder="Meds" className="flex-1 p-1 border rounded text-sm" value={med.name} onChange={e => handleMedicineChange(index, 'name', e.target.value)} />
                        <select className="p-1 border rounded text-sm bg-white" value={med.unit} onChange={e => handleMedicineChange(index, 'unit', e.target.value)}><option>Tablet</option><option>Syrup</option><option>Cream</option></select>
                        <input type="text" placeholder="Dosage" className="flex-1 p-1 border rounded text-sm" value={med.dosage} onChange={e => handleMedicineChange(index, 'dosage', e.target.value)} />
                        {medicines.length > 1 && <button type="button" onClick={() => handleRemoveRow(index)}><Trash2 size={16} className="text-red-400"/></button>}
                      </div>
                    ))}
                  </div>
                  <textarea className="w-full p-2 border rounded h-20 text-sm" placeholder="Notes..." value={doctorNotes} onChange={e => setDoctorNotes(e.target.value)}></textarea>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg">Save & Send</button>
                </form>
              ) : (
                <form onSubmit={handleLabUpload} className="space-y-4">
                  <input type="file" onChange={e => setLabFile(e.target.files[0])} className="w-full text-sm mb-2"/>
                  <select className="w-full p-2 border rounded bg-white" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}><option value="">-- Choose Patient --</option>{myPatients.map(p => <option key={p} value={p}>{p}</option>)}</select>
                  <input type="text" placeholder="Test Name" className="w-full p-2 border rounded" value={labName} onChange={e => setLabName(e.target.value)} />
                  <button className="w-full bg-orange-600 text-white font-bold py-2 rounded">Upload</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: ALL PATIENTS TAB */}
        {activeView === 'patients' && (
           <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Users className="text-blue-600"/> All Registered Patients</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm border-b"><th className="p-4">Date Joined</th><th className="p-4">Name</th><th className="p-4">NID</th><th className="p-4">Phone</th><th className="p-4">Role</th></tr>
                  </thead>
                  <tbody>
                    {allPatientsList.map(p => {
                       const profile = profiles[p.username] || {};
                       return (
                         <tr key={p.id} className="border-b hover:bg-slate-50">
                           <td className="p-4 text-slate-500 text-xs font-mono">{new Date(p.id).toLocaleDateString()}</td>
                           <td className="p-4 font-bold text-slate-700">{p.name}</td>
                           <td className="p-4 font-mono text-slate-500">{p.username}</td>
                           <td className="p-4 text-slate-500">{profile.phone || 'N/A'}</td>
                           <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Patient</span></td>
                         </tr>
                       )
                    })}
                  </tbody>
                </table>
              </div>
           </div>
        )}

        {/* VIEW 3: SEARCH RECORDS */}
        {activeView === 'records' && (
           <div className="max-w-4xl mx-auto p-6">
              <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Search Patient History</h2>
                  <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
                      <input type="text" placeholder="Enter NID (e.g. A999999)" className="flex-1 p-3 border rounded-lg" value={searchNid} onChange={e => setSearchNid(e.target.value)}/>
                      <button className="bg-blue-600 text-white px-6 rounded-lg font-bold flex items-center gap-2"><Search size={18}/> Search</button>
                  </form>
              </div>
              {foundPatient && (
                  <div className="space-y-6">
                      <div className="bg-white p-6 rounded-xl shadow-md border border-l-4 border-l-blue-500 flex justify-between items-start">
                          <div>
                              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><User /> {foundPatient.name}</h3>
                              <p className="text-slate-500">NID: {foundPatient.username}</p>
                              <div className="flex gap-4 mt-2 text-sm">
                                  <span className="bg-slate-100 px-2 py-1 rounded">Age: {foundPatient.profile.age || '--'}</span>
                                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Ins: {foundPatient.profile.insurance || 'None'}</span>
                              </div>
                          </div>
                          <div className="text-right text-red-600 font-bold bg-red-50 p-2 rounded border border-red-100">⚠️ Allergies: {foundPatient.profile.allergies || 'None'}</div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-700">Prescription History</h3>
                      {foundPatient.history.length === 0 ? <p className="text-slate-400">No records found.</p> : (
                          <div className="space-y-4">
                              {foundPatient.history.map(rx => (
                                  <div key={rx.id} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center hover:shadow-md transition">
                                      <div>
                                          <p className="font-bold text-slate-800">{rx.date} - Dr. {rx.doctor}</p>
                                          <p className="text-sm font-semibold text-blue-600">Dx: {rx.diagnosis || 'General'}</p>
                                          <p className="text-xs text-slate-500 mt-1">{rx.medicines.length} Medicines</p>
                                      </div>
                                      <button onClick={() => setPrintData({ ...rx, profile: foundPatient.profile })} className="text-slate-600 hover:text-black border p-2 rounded flex items-center gap-2 text-sm hover:bg-slate-50">
                                          <Eye size={16}/> View & Print
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}
           </div>
        )}

      </div>
    </div>
  );
};

export default DoctorDashboard;