import React, { useState } from 'react';
import { User, Appointment, QueueToken, Patient, Prescription, Language, Doctor } from '../types';
import { suggestDiagnosisAndTreatment } from '../services/geminiService';
import { MOCK_PATIENTS } from '../constants';
import { getT } from '../utils/localization';

interface DoctorViewProps {
  currentUser: User;
  appointments: Appointment[];
  queue: QueueToken[];
  onUpdateStatus: (apptId: string, status: string, generateToken?: boolean) => void;
  onUpdateQueue: (tokenId: string, status: string) => void;
  onAddPrescription: (prescription: Prescription) => void;
  lang: Language;
}

const DoctorView: React.FC<DoctorViewProps> = ({ 
  currentUser, 
  appointments, 
  queue, 
  onUpdateStatus, 
  onUpdateQueue, 
  onAddPrescription,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'consultation' | 'calendar'>('consultation');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState<string[]>([]);
  const [currentMed, setCurrentMed] = useState('');

  const doc = currentUser as Doctor;
  const myAppointments = appointments.filter(a => a.doctorId === currentUser.id);
  const todayAppointments = myAppointments; // For demo, assume all are today
  
  // Sort: Serving first, then waiting, then pending
  const sortedQueue = queue
    .filter(q => q.doctorId === currentUser.id && q.status !== 'FINISHED')
    .sort((a, b) => (a.status === 'SERVING' ? -1 : 1));

  const currentPatient = selectedAppt ? MOCK_PATIENTS.find(p => p.id === selectedAppt.patientId) : null;

  const handleAiSuggest = async () => {
    if (!selectedAppt || !currentPatient) return;
    setAiLoading(true);
    const result = await suggestDiagnosisAndTreatment(
      selectedAppt.reason + " " + notes,
      currentPatient.age,
      currentPatient.gender
    );
    if (result) {
      setAiSuggestion(result);
      if (result.diagnoses?.length > 0) setDiagnosis(result.diagnoses[0]);
    }
    setAiLoading(false);
  };

  const applyAiSuggestion = () => {
     if(aiSuggestion) {
        if(aiSuggestion.treatmentPlan) setNotes(prev => prev + "\n\nTreatment Plan: " + aiSuggestion.treatmentPlan);
        if(aiSuggestion.suggestedMedications) setMedications(aiSuggestion.suggestedMedications);
     }
  };

  const handleFinishConsultation = () => {
    if(!selectedAppt) return;
    
    // Create prescription
    const prescription: Prescription = {
        id: Math.random().toString(36).substr(2, 9),
        appointmentId: selectedAppt.id,
        doctorId: selectedAppt.doctorId,
        patientId: selectedAppt.patientId,
        diagnosis,
        medications,
        notes,
        date: new Date().toISOString().split('T')[0]
    };
    onAddPrescription(prescription);

    // Update Queue if exists
    const token = queue.find(q => q.appointmentId === selectedAppt.id);
    if(token) {
        onUpdateQueue(token.id, 'FINISHED');
    }
    
    // Update Appointment
    onUpdateStatus(selectedAppt.id, 'COMPLETED');
    
    // Reset
    setSelectedAppt(null);
    setAiSuggestion(null);
    setDiagnosis('');
    setNotes('');
    setMedications([]);
  };

  const addMedication = () => {
    if (currentMed) {
      setMedications([...medications, currentMed]);
      setCurrentMed('');
    }
  };

  const renderConsultation = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Col: Queue & Appointment List */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-4 overflow-y-auto flex flex-col gap-6">
        
        {/* Active Queue Control */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <i className="fas fa-users text-primary"></i> Live Queue
          </h3>
          {sortedQueue.length > 0 ? (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 uppercase font-bold">{getT(lang, 'nowServing')}</span>
                <span className="text-2xl font-bold text-primary">{sortedQueue[0].number}</span>
              </div>
               {sortedQueue[0].status === 'SERVING' ? (
                 <button 
                    onClick={() => {
                        const appt = myAppointments.find(a => a.id === sortedQueue[0].appointmentId);
                        if(appt) setSelectedAppt(appt);
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium transition"
                 >
                    Open Consultation Panel
                 </button>
               ) : (
                 <button 
                    onClick={() => onUpdateQueue(sortedQueue[0].id, 'SERVING')}
                    className="w-full bg-primary hover:bg-sky-600 text-white py-2 rounded-lg text-sm font-medium transition"
                 >
                    Call Next Patient
                 </button>
               )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No active queue.</p>
          )}
          
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase">{getT(lang, 'upNext')}</p>
             {sortedQueue.slice(1).map(q => (
                 <div key={q.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                     <span className="font-bold text-gray-700">{q.number}</span>
                     <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">WAITING</span>
                 </div>
             ))}
          </div>
        </div>

        {/* Appointment Requests */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Today's Appointments</h3>
          <div className="space-y-3">
            {todayAppointments.map(appt => (
              <div key={appt.id} className="p-3 border rounded-lg hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedAppt(appt)}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{appt.patientName}</p>
                    <p className="text-xs text-gray-500">{appt.time} - {appt.reason}</p>
                  </div>
                  {appt.status === 'PENDING' && (
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateStatus(appt.id, 'APPROVED', true); }}
                        className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Approve & Queue">
                        <i className="fas fa-check"></i>
                      </button>
                      <button 
                         onClick={(e) => { e.stopPropagation(); onUpdateStatus(appt.id, 'CANCELLED'); }}
                         className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Reject">
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                  {appt.status === 'APPROVED' && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Approved</span>
                  )}
                   {appt.status === 'COMPLETED' && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Done</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Col: Consultation Panel */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 overflow-y-auto">
        {selectedAppt ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{getT(lang, 'consultation')}: {selectedAppt.patientName}</h2>
                <div className="flex gap-4 mt-1 text-sm text-gray-500">
                   <span><i className="fas fa-venus-mars mr-1"></i> {currentPatient?.gender}, {currentPatient?.age} yrs</span>
                   <span><i className="far fa-id-card mr-1"></i> {currentPatient?.nic}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  selectedAppt.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
              }`}>
                  {selectedAppt.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{getT(lang, 'symptoms')}</label>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-700 border border-gray-200">
                        {selectedAppt.reason}
                    </div>
                </div>

                <div className="col-span-2">
                     <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                         <button 
                            onClick={handleAiSuggest}
                            disabled={aiLoading}
                            className="text-xs bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full shadow hover:opacity-90 flex items-center gap-2 transition"
                         >
                            {aiLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                            {getT(lang, 'aiAssistant')}
                         </button>
                     </div>
                    
                    {aiSuggestion && (
                        <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-lg animate-fade-in">
                            <p className="text-xs font-bold text-purple-700 mb-1">AI Suggestion</p>
                            <div className="text-sm text-gray-700 space-y-1">
                                <p><strong>Potential Diagnosis:</strong> {aiSuggestion.diagnoses?.join(', ')}</p>
                                <p><strong>Plan:</strong> {aiSuggestion.treatmentPlan}</p>
                            </div>
                            <button onClick={applyAiSuggestion} className="mt-2 text-xs text-purple-600 font-bold underline hover:text-purple-800">Apply Suggestions</button>
                        </div>
                    )}

                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Enter diagnosis..."
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
                    <textarea 
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Observations, treatment plan..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{getT(lang, 'prescription')}</label>
                    <div className="flex gap-2 mb-2">
                        <input 
                            type="text"
                            className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="e.g. Panadol 500mg"
                            value={currentMed}
                            onChange={(e) => setCurrentMed(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                        />
                        <button onClick={addMedication} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 rounded-lg font-medium">+</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {medications.map((med, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                {med}
                                <button onClick={() => setMedications(medications.filter((_, i) => i !== idx))} className="text-blue-400 hover:text-blue-600">&times;</button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t flex justify-end gap-3">
                <button 
                    onClick={() => setSelectedAppt(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleFinishConsultation}
                    className="px-6 py-2 bg-primary hover:bg-sky-600 text-white rounded-lg font-medium shadow transition"
                >
                    Complete & Prescribe
                </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <i className="fas fa-user-md text-6xl mb-4 text-gray-200"></i>
            <p>Select a patient from the queue or appointment list to start consultation.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
        {/* Doctor Tabs */}
        <div className="flex border-b border-gray-200 justify-between items-center">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('consultation')}
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'consultation' ? 'text-secondary' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <i className="fas fa-stethoscope mr-2"></i> {getT(lang, 'consultation')}
                {activeTab === 'consultation' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'calendar' ? 'text-secondary' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <i className="fas fa-calendar-alt mr-2"></i> Schedule
                {activeTab === 'calendar' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary"></div>}
            </button>
          </div>
          <div className="px-4 text-xs text-gray-500 font-mono">
             {doc.slmcNumber} | Room {doc.roomNumber}
          </div>
      </div>

      {activeTab === 'consultation' ? renderConsultation() : <div className="bg-white p-6 rounded-xl">Calendar Feature Placeholder</div>}
    </div>
  );
};

export default DoctorView;