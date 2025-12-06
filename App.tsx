import React, { useState } from 'react';
import { User, Role, Appointment, QueueToken, Prescription, Invoice, Doctor, Language } from './types';
import { MOCK_DOCTORS, MOCK_PATIENTS, MOCK_ADMIN, INITIAL_APPOINTMENTS, INITIAL_QUEUE, MOCK_INVOICES } from './constants';
import PatientView from './components/PatientView';
import DoctorView from './components/DoctorView';
import AdminView from './components/AdminView';
import QueueDisplay from './components/QueueDisplay';
import { getT } from './utils/localization';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [queue, setQueue] = useState<QueueToken[]>(INITIAL_QUEUE);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [isQueueDisplayMode, setIsQueueDisplayMode] = useState(false);
  const [lang, setLang] = useState<Language>('EN');

  // Simple "Login" simulation
  const handleLogin = (role: Role) => {
    if (role === 'PATIENT') setCurrentUser(MOCK_PATIENTS[0]);
    if (role === 'DOCTOR') setCurrentUser(MOCK_DOCTORS[0]);
    if (role === 'ADMIN') setCurrentUser(MOCK_ADMIN);
  };

  const handleLogout = () => setCurrentUser(null);

  // Data handlers
  const handleBookAppointment = (apptData: Partial<Appointment>) => {
    const newAppt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: apptData.patientId!,
      doctorId: apptData.doctorId!,
      patientName: apptData.patientName!,
      doctorName: apptData.doctorName!,
      date: apptData.date!,
      time: apptData.time!,
      reason: apptData.reason!,
      status: 'PENDING',
      hospitalType: 'Private'
    };
    setAppointments([...appointments, newAppt]);
  };

  const handleUpdateStatus = (apptId: string, status: string, generateToken: boolean = false) => {
    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: status as any } : a));
    
    if (generateToken && status === 'APPROVED') {
      const appt = appointments.find(a => a.id === apptId);
      if (appt) {
        // Generate SL Style Token: SLDOC-{docId}-{RunningNumber}
        const docTokenCount = queue.filter(q => q.doctorId === appt.doctorId).length + 1;
        const tokenNum = `SLDOC-${appt.doctorId}-${docTokenCount.toString().padStart(3, '0')}`;
        
        const newToken: QueueToken = {
          id: Math.random().toString(36).substr(2, 9),
          number: tokenNum,
          appointmentId: appt.id,
          doctorId: appt.doctorId,
          status: 'WAITING',
          created_at: new Date().toISOString()
        };
        setQueue([...queue, newToken]);
      }
    }
  };

  const handleUpdateQueue = (tokenId: string, status: string) => {
    setQueue(prev => prev.map(q => q.id === tokenId ? { ...q, status: status as any } : q));
  };

  const handleAddPrescription = (p: Prescription) => {
    setPrescriptions([...prescriptions, p]);
    
    // Auto-generate invoice upon completion (SL LKR Logic)
    const doc = MOCK_DOCTORS.find(d => d.id === p.doctorId);
    const consultationFee = doc?.consultationFee || 1500;
    const medicineCharge = 1200; // Mock fixed medicine charge for now

    const invoice: Invoice = {
        id: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        appointmentId: p.appointmentId,
        patientId: p.patientId as string, // Simplified for mock logic
        consultationFee: consultationFee,
        medicineCharge: medicineCharge,
        totalAmount: consultationFee + medicineCharge,
        status: 'UNPAID',
        date: p.date
    };
    setInvoices(prev => [...prev, invoice]);
  };

  const handlePayInvoice = (invoiceId: string) => {
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv));
      alert("Payment processed successfully! (PayHere/Genie Mock)");
  };

  // Queue Display Mode
  if (isQueueDisplayMode) {
      return (
        <QueueDisplay 
            queue={queue} 
            doctors={MOCK_DOCTORS} 
            onExit={() => setIsQueueDisplayMode(false)} 
        />
      );
  }

  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row relative">
            <button 
                onClick={() => setIsQueueDisplayMode(true)}
                className="absolute top-4 right-4 text-gray-400 hover:text-primary transition z-10"
                title="Launch Waiting Room Display"
            >
                <i className="fas fa-tv text-xl"></i>
            </button>

          <div className="md:w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 p-8 flex flex-col justify-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
            <div className="relative z-10">
                <img src="/assets/lm_logo.svg" alt="LM Health" className="h-86 w-auto mb-6" />
                <h1 className="text-5xl font-bold mb-2">LANKA HEALTH</h1>
                <p className="text-slate-400 text-lg mb-8 tracking-wide">SRI LANKA'S PREMIER QUEUE SYSTEM</p>
                <div className="flex gap-2 text-xs opacity-70">
                <span className="border border-white/20 px-3 py-1 rounded-full">Secure (SSL)</span>
                <span className="border border-white/20 px-3 py-1 rounded-full">PDPA Compliant</span>
                </div>
            </div>
          </div>
          <div className="md:w-1/2 p-12 flex flex-col justify-center space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{getT(lang, 'login')}</h2>
                <div className="flex gap-2 text-xs">
                    <button onClick={() => setLang('EN')} className={`px-2 py-1 rounded ${lang === 'EN' ? 'bg-primary text-white' : 'bg-gray-100'}`}>EN</button>
                    <button onClick={() => setLang('SI')} className={`px-2 py-1 rounded ${lang === 'SI' ? 'bg-primary text-white' : 'bg-gray-100'}`}>සිං</button>
                    <button onClick={() => setLang('TA')} className={`px-2 py-1 rounded ${lang === 'TA' ? 'bg-primary text-white' : 'bg-gray-100'}`}>த</button>
                </div>
            </div>
            
            <button 
              onClick={() => handleLogin('PATIENT')} 
              className="w-full py-4 px-6 border-2 border-gray-100 rounded-xl flex items-center gap-4 hover:border-primary hover:bg-blue-50 transition group"
            >
              <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition">
                <i className="fas fa-user"></i>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">{getT(lang, 'patient')}</p>
                <p className="text-xs text-gray-500">Bookings, History</p>
              </div>
            </button>

            <button 
              onClick={() => handleLogin('DOCTOR')} 
              className="w-full py-4 px-6 border-2 border-gray-100 rounded-xl flex items-center gap-4 hover:border-secondary hover:bg-teal-50 transition group"
            >
              <div className="w-12 h-12 bg-teal-100 text-secondary rounded-full flex items-center justify-center group-hover:scale-110 transition">
                <i className="fas fa-user-md"></i>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">{getT(lang, 'doctor')}</p>
                <p className="text-xs text-gray-500">Consultations</p>
              </div>
            </button>

             <button 
              onClick={() => handleLogin('ADMIN')} 
              className="w-full py-4 px-6 border-2 border-gray-100 rounded-xl flex items-center gap-4 hover:border-accent hover:bg-rose-50 transition group"
            >
              <div className="w-12 h-12 bg-rose-100 text-accent rounded-full flex items-center justify-center group-hover:scale-110 transition">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">{getT(lang, 'admin')}</p>
                <p className="text-xs text-gray-500">System Control</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-inter">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white shadow-xl z-10 flex flex-col fixed inset-y-0">
        <div className="p-6 border-b border-slate-700 flex flex-col gap-2">
            <img src="/assets/lm_logo.svg" alt="LM Health" className="h-1 w-auto" />
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
           {currentUser.role === 'PATIENT' && (
             <>
               <div className="px-4 py-3 bg-primary/20 text-primary font-medium rounded-lg cursor-pointer border border-primary/30">
                 <i className="fas fa-home w-6"></i> {getT(lang, 'dashboard')}
               </div>
               <div className="px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 font-medium rounded-lg cursor-pointer transition">
                 <i className="fas fa-file-medical w-6"></i> {getT(lang, 'medicalRecords')}
               </div>
             </>
           )}
           {currentUser.role === 'DOCTOR' && (
             <>
               <div className="px-4 py-3 bg-secondary/20 text-secondary font-medium rounded-lg cursor-pointer border border-secondary/30">
                 <i className="fas fa-stethoscope w-6"></i> {getT(lang, 'consultation')}
               </div>
               <div className="px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 font-medium rounded-lg cursor-pointer transition">
                 <i className="fas fa-calendar-alt w-6"></i> Schedule
               </div>
             </>
           )}
           {currentUser.role === 'ADMIN' && (
             <>
               <div className="px-4 py-3 bg-rose-500/20 text-rose-400 font-medium rounded-lg cursor-pointer border border-rose-500/30">
                 <i className="fas fa-chart-pie w-6"></i> Overview
               </div>
               <div className="px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 font-medium rounded-lg cursor-pointer transition">
                 <i className="fas fa-user-cog w-6"></i> Manage Users
               </div>
             </>
           )}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3 mb-4">
            <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full bg-slate-600 border border-slate-500" />
            <div>
              <p className="text-sm font-bold text-white">{currentUser.name}</p>
              <p className="text-xs text-slate-400 capitalize">{currentUser.role.toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition"
          >
            <i className="fas fa-sign-out-alt mr-2"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {currentUser.role === 'PATIENT' && getT(lang, 'welcome') + ', ' + currentUser.name}
              {currentUser.role === 'DOCTOR' && 'Doctor Console'}
              {currentUser.role === 'ADMIN' && 'System Overview'}
            </h1>
            <div className="flex items-center gap-4">
               {/* Language Toggle in Header */}
               <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                    <button onClick={() => setLang('EN')} className={`px-3 py-1 text-xs font-bold rounded ${lang === 'EN' ? 'bg-slate-800 text-white' : 'text-gray-500'}`}>EN</button>
                    <button onClick={() => setLang('SI')} className={`px-3 py-1 text-xs font-bold rounded ${lang === 'SI' ? 'bg-slate-800 text-white' : 'text-gray-500'}`}>සිං</button>
                    <button onClick={() => setLang('TA')} className={`px-3 py-1 text-xs font-bold rounded ${lang === 'TA' ? 'bg-slate-800 text-white' : 'text-gray-500'}`}>த</button>
               </div>
               
               <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <i className="fas fa-bell"></i>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
               </button>
            </div>
        </header>
        
        {currentUser.role === 'PATIENT' && (
          <PatientView 
            currentUser={currentUser} 
            appointments={appointments} 
            queue={queue}
            invoices={invoices}
            onBookAppointment={handleBookAppointment}
            onPayInvoice={handlePayInvoice}
            lang={lang}
          />
        )}

        {currentUser.role === 'DOCTOR' && (
          <DoctorView 
            currentUser={currentUser}
            appointments={appointments}
            queue={queue}
            onUpdateStatus={handleUpdateStatus}
            onUpdateQueue={handleUpdateQueue}
            onAddPrescription={handleAddPrescription}
            lang={lang}
          />
        )}

        {currentUser.role === 'ADMIN' && (
          <AdminView 
            stats={{
              patientsCount: MOCK_PATIENTS.length + 24, // Mock dynamic stats
              doctorsCount: MOCK_DOCTORS.length,
              appointmentsCount: appointments.length
            }}
            appointments={appointments}
          />
        )}
      </main>
    </div>
  );
};

export default App;