import React, { useState } from 'react';
import { User, Appointment, Doctor, QueueToken, Invoice, Language } from '../types';
import { MOCK_DOCTORS } from '../constants';
import { summarizeMedicalHistory } from '../services/geminiService';
import { getT } from '../utils/localization';

interface PatientViewProps {
  currentUser: User;
  appointments: Appointment[];
  queue: QueueToken[];
  invoices: Invoice[];
  onBookAppointment: (appt: Partial<Appointment>) => void;
  onPayInvoice: (invoiceId: string) => void;
  lang: Language;
}

const PatientView: React.FC<PatientViewProps> = ({ 
  currentUser, 
  appointments, 
  queue, 
  invoices,
  onBookAppointment, 
  onPayInvoice,
  lang
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'billing'>('dashboard');
  const [showBookModal, setShowBookModal] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const myAppointments = appointments.filter(a => a.patientId === currentUser.id);
  const myInvoices = invoices.filter(i => i.patientId === currentUser.id);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const doctor = MOCK_DOCTORS.find(d => d.id === selectedDoctor);
    if (!doctor) return;

    onBookAppointment({
      doctorId: selectedDoctor,
      doctorName: doctor.name,
      date,
      time,
      reason,
      status: 'PENDING',
      patientId: currentUser.id,
      patientName: currentUser.name,
      hospitalType: 'Private'
    });
    setShowBookModal(false);
    // Reset form
    setSelectedDoctor('');
    setDate('');
    setTime('');
    setReason('');
  };

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    const historyNotes = myAppointments
        .filter(a => a.status === 'COMPLETED')
        .map(a => `${getT(lang, 'date')}: ${a.date}, ${getT(lang, 'reason')}: ${a.reason}, ${getT(lang, 'doctor')}: ${a.doctorName}`);
    
    if(historyNotes.length === 0) {
        setAiSummary("No medical history available to summarize.");
    } else {
        const summary = await summarizeMedicalHistory(historyNotes);
        setAiSummary(summary || "Could not generate summary.");
    }
    setLoadingSummary(false);
  };

  const getQueueStatus = (apptId: string) => {
    const token = queue.find(q => q.appointmentId === apptId);
    if (!token) return null;
    
    let colorClass = 'bg-gray-100 text-gray-800';
    if(token.status === 'SERVING') colorClass = 'bg-green-100 text-green-800 animate-pulse';
    if(token.status === 'WAITING') colorClass = 'bg-yellow-100 text-yellow-800';
    if(token.status === 'FINISHED') colorClass = 'bg-blue-100 text-blue-800';

    return (
      <div className={`mt-2 p-2 rounded-lg text-center font-bold ${colorClass}`}>
        <p className="text-xs uppercase">{getT(lang, 'queueToken')}</p>
        <p className="text-xl">{token.number}</p>
        <p className="text-xs mt-1">{token.status}</p>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myAppointments.filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED').length === 0 ? (
            <div className="col-span-full text-center py-10 bg-white rounded-xl shadow-sm">
                <p className="text-gray-500">No upcoming appointments.</p>
                <button onClick={() => setShowBookModal(true)} className="mt-4 text-primary font-bold hover:underline">{getT(lang, 'bookAppt')}</button>
            </div>
        ) : (
            myAppointments
            .filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED')
            .map(appt => (
                <div key={appt.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-bold text-gray-800">{appt.doctorName}</h4>
                            <p className="text-sm text-gray-500">{appt.date} at {appt.time}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            appt.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                        }`}>
                            {appt.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{getT(lang, 'reason')}: {appt.reason}</p>
                    {getQueueStatus(appt.id)}
                </div>
            ))
        )}
    </div>
  );

  const renderHistory = () => (
      <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className="text-lg font-bold text-indigo-900 mb-2">{getT(lang, 'aiAssistant')}</h3>
                      <p className="text-sm text-indigo-700 mb-4">Get a concise summary of your medical history powered by Gemini AI.</p>
                  </div>
                  <button 
                    onClick={handleGenerateSummary}
                    disabled={loadingSummary}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                  >
                     {loadingSummary ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                     Generate Summary
                  </button>
              </div>
              {aiSummary && (
                  <div className="bg-white p-4 rounded-lg shadow-sm text-gray-700 text-sm leading-relaxed border border-indigo-100">
                      {aiSummary}
                  </div>
              )}
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
             <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">{getT(lang, 'date')}</th>
                        <th className="px-6 py-3">{getT(lang, 'doctor')}</th>
                        <th className="px-6 py-3">{getT(lang, 'reason')}</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {myAppointments.filter(a => a.status === 'COMPLETED').length > 0 ? (
                        myAppointments.filter(a => a.status === 'COMPLETED').map(appt => (
                            <tr key={appt.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{appt.date}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{appt.doctorName}</td>
                                <td className="px-6 py-4">{appt.reason}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Completed</span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No medical history records found.</td>
                        </tr>
                    )}
                </tbody>
             </table>
          </div>
      </div>
  );

  const renderBilling = () => (
      <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myInvoices.map(invoice => (
                  <div key={invoice.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ref #{invoice.id}</p>
                             <h4 className="text-lg font-bold text-gray-800 mt-1">{invoice.date}</h4>
                         </div>
                         <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                             invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                         }`}>
                             {invoice.status}
                         </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4 border-b pb-4">
                        <div className="flex justify-between">
                            <span>{getT(lang, 'consultation')}</span>
                            <span>Rs. {invoice.consultationFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Medicine/Other</span>
                            <span>Rs. {invoice.medicineCharge.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-800 text-base pt-2">
                            <span>{getT(lang, 'total')}</span>
                            <span>Rs. {invoice.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="mt-auto flex justify-end gap-3">
                          {invoice.status === 'UNPAID' && (
                              <button 
                                onClick={() => onPayInvoice(invoice.id)}
                                className="bg-primary hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                              >
                                {getT(lang, 'payNow')}
                              </button>
                          )}
                      </div>
                  </div>
              ))}
              {myInvoices.length === 0 && (
                   <div className="col-span-full text-center py-10 bg-white rounded-xl shadow-sm">
                      <p className="text-gray-500">No invoices found.</p>
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{getT(lang, 'welcome')}, {currentUser.name}</h2>
        <button
          onClick={() => setShowBookModal(true)}
          className="bg-primary hover:bg-sky-600 text-white px-4 py-2 rounded-lg shadow transition"
        >
          {getT(lang, 'bookAppt')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'dashboard' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <i className="fas fa-th-large mr-2"></i> {getT(lang, 'dashboard')}
              {activeTab === 'dashboard' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'history' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <i className="fas fa-history mr-2"></i> {getT(lang, 'medicalRecords')}
              {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'billing' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <i className="fas fa-file-invoice-dollar mr-2"></i> {getT(lang, 'billing')}
              {activeTab === 'billing' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
          </button>
      </div>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'history' && renderHistory()}
      {activeTab === 'billing' && renderBilling()}

      {/* Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700">{getT(lang, 'bookAppt')}</h3>
                    <button onClick={() => setShowBookModal(false)} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form onSubmit={handleBook} className="space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{getT(lang, 'selectDoctor')}</label>
                    <select
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                    >
                        <option value="">-- {getT(lang, 'selectDoctor')} --</option>
                        {MOCK_DOCTORS.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization}</option>
                        ))}
                    </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{getT(lang, 'date')}</label>
                        <input
                        required
                        type="date"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{getT(lang, 'time')}</label>
                        <input
                        required
                        type="time"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{getT(lang, 'symptoms')}</label>
                    <textarea
                        required
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Describe..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    ></textarea>
                    </div>

                    <div className="flex gap-3 mt-4">
                         <button type="button" onClick={() => setShowBookModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700">Cancel</button>
                         <button type="submit" className="flex-1 bg-primary hover:bg-sky-600 text-white py-2 rounded-lg font-medium transition">Confirm</button>
                    </div>
                </form>
             </div>
        </div>
      )}
    </div>
  );
};

export default PatientView;