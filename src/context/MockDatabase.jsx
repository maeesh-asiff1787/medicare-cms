import React, { createContext, useState, useContext, useEffect } from 'react';

const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
  // --- INITIAL DATA ---
const initialUsers = [
    { id: 1701000000001, username: 'admin', password: '123', role: 'admin', name: 'System Admin' },
    // Doctors now use long IDs too
    { id: 1701000000002, username: 'drsarah', password: '123', role: 'doctor', name: 'Dr. Sarah (Cardiology)' },
    { id: 1701000000003, username: 'drjames', password: '123', role: 'doctor', name: 'Dr. James (General)' }
  ];

  const initialDoctors = [
    // Matching IDs
    { id: 1701000000002, name: 'Dr. Sarah (Cardiology)', specialty: 'Cardiology' },
    { id: 1701000000003, name: 'Dr. James (General)', specialty: 'General Medicine' }
  ];

  // --- STATE ---
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('db_users')) || initialUsers);
  const [doctors, setDoctors] = useState(() => JSON.parse(localStorage.getItem('db_doctors')) || initialDoctors);
  const [appointments, setAppointments] = useState(() => JSON.parse(localStorage.getItem('db_appointments')) || []);
  const [prescriptions, setPrescriptions] = useState(() => JSON.parse(localStorage.getItem('db_prescriptions')) || []);
  const [labReports, setLabReports] = useState(() => JSON.parse(localStorage.getItem('db_labReports')) || []);
  const [profiles, setProfiles] = useState(() => JSON.parse(localStorage.getItem('db_profiles')) || {});
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')) || null);

  // --- AUTO SAVE ---
  useEffect(() => { localStorage.setItem('db_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('db_doctors', JSON.stringify(doctors)); }, [doctors]);
  useEffect(() => { localStorage.setItem('db_appointments', JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem('db_prescriptions', JSON.stringify(prescriptions)); }, [prescriptions]);
  useEffect(() => { localStorage.setItem('db_labReports', JSON.stringify(labReports)); }, [labReports]);
  useEffect(() => { localStorage.setItem('db_profiles', JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem('currentUser', JSON.stringify(currentUser)); }, [currentUser]);

  // --- AUTH ACTIONS ---
  const login = (username, password) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true, role: user.role };
    }
    return { success: false, message: 'Invalid Credentials!' };
  };

  const logout = () => {
    setCurrentUser(null);
    window.location.href = '/'; 
  };

  const registerPatient = (fullName, nid, age, sex, phone, password) => {
    if (users.find(u => u.username === nid)) return { success: false, message: "User with this NID already exists!" };
    const newUser = { id: Date.now(), username: nid, password: password, role: 'patient', name: fullName };
    setUsers([...users, newUser]);
    setProfiles({ ...profiles, [nid]: { nid, age, sex, phone, address: '', insurance: '', dob: '', allergies: '' } });
    return { success: true };
  };

  // --- ADMIN ACTIONS ---
  const addDoctor = (name, specialty) => {
    const fullName = `${name} (${specialty})`;
    const newDoc = { id: Date.now(), name: fullName, specialty };
    setDoctors([...doctors, newDoc]);
    
    // Auto-create login
    const username = name.split(' ')[1]?.toLowerCase() || name.toLowerCase();
    setUsers([...users, { id: Date.now(), username, password: '123', role: 'doctor', name: fullName }]);
  };

  // NEW: DELETE DOCTOR LOGIC
  const deleteDoctor = (id) => {
    // 1. Find the doctor details first
    const doctorToDelete = doctors.find(d => d.id === id);
    
    // 2. Remove from the visual 'Doctors List'
    setDoctors(doctors.filter(d => d.id !== id));

    // 3. (Optional but good) Remove their login access from 'Users'
    if (doctorToDelete) {
        setUsers(users.filter(u => u.name !== doctorToDelete.name));
    }
  };

  // --- APPOINTMENT ACTIONS ---
  const addAppointment = (appt) => {
    setAppointments([...appointments, { ...appt, id: Date.now(), status: 'Pending', patient: currentUser.name, username: currentUser.username }]);
  };

  const updateStatus = (id, newStatus) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const deleteAppointment = (id) => {
    setAppointments(appointments.filter(app => app.id !== id));
  };

  // --- CLINICAL ACTIONS ---
  const addPrescription = (data) => {
    setPrescriptions([...prescriptions, { 
      ...data, 
      id: Date.now(), 
      doctor: currentUser.name, 
      date: new Date().toISOString().split('T')[0] 
    }]);
  };

  const uploadLabReport = (patientName, fileName, fileData, uploaderRole) => {
    setLabReports([...labReports, { 
      id: Date.now(), 
      patient: patientName, 
      testName: fileName, 
      fileData, 
      uploadedBy: uploaderRole, 
      date: new Date().toISOString().split('T')[0], 
      status: 'Ready' 
    }]);
  };

  const updateProfile = (username, data) => {
    setProfiles({ ...profiles, [username]: data });
  };

  const getStats = () => {
    return {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'Pending').length,
      completed: appointments.filter(a => a.status === 'Completed').length,
      revenue: appointments.filter(a => a.status === 'Completed').length * 50
    };
  };

  return (
    <DatabaseContext.Provider value={{ 
      currentUser, appointments, prescriptions, labReports, doctors, profiles, users,
      login, logout, registerPatient, addAppointment, updateStatus, deleteAppointment, 
      addPrescription, uploadLabReport, addDoctor, deleteDoctor, updateProfile, getStats
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);