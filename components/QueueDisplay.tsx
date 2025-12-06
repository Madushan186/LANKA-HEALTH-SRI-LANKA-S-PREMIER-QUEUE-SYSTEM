import React from 'react';
import { QueueToken, Doctor } from '../types';

interface QueueDisplayProps {
  queue: QueueToken[];
  doctors: Doctor[];
  onExit: () => void;
}

const QueueDisplay: React.FC<QueueDisplayProps> = ({ queue, doctors, onExit }) => {
  const serving = queue.filter(q => q.status === 'SERVING');
  const waiting = queue.filter(q => q.status === 'WAITING').slice(0, 5);

  const getDoctor = (id: string) => doctors.find(d => d.id === id);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-6">
            <img src="/assets/lm_logo.svg" alt="LM Health" className="h-16 w-auto" />
            <div className="border-l border-slate-600 pl-6">
                <h1 className="text-3xl font-bold tracking-tight text-white">OPD LIVE QUEUE</h1>
                <p className="text-slate-400 text-sm tracking-wider">SRI LANKA • ASIA/COLOMBO</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-2xl font-mono text-primary font-bold">
                    {new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-slate-500">
                    {new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Colombo', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
            <button onClick={onExit} className="text-slate-500 hover:text-white transition">
                <i className="fas fa-times text-2xl"></i>
            </button>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Now Serving Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-3xl font-bold text-green-400 uppercase tracking-wider mb-6 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-ping"></span>
            Now Serving
          </h2>
          
          <div className="grid gap-6">
            {serving.length > 0 ? serving.map(token => {
              const doc = getDoctor(token.doctorId);
              return (
                <div key={token.id} className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-2xl p-8 border-l-8 border-green-500 flex justify-between items-center shadow-2xl">
                  <div>
                    <p className="text-green-400 text-lg font-bold mb-1 tracking-widest uppercase">Token Number</p>
                    <p className="text-7xl font-black text-white font-mono">{token.number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-white mb-2">{doc?.name}</p>
                    <p className="text-xl text-primary font-medium">{doc?.specialization}</p>
                    <div className="mt-4 bg-primary/20 border border-primary/50 inline-block px-8 py-3 rounded-full">
                      <span className="text-3xl font-bold text-white">Room {doc?.roomNumber}</span>
                    </div>
                  </div>
                </div>
              );
            }) : (
                <div className="bg-slate-800/50 rounded-2xl p-20 text-center border-2 border-dashed border-slate-700">
                    <p className="text-3xl text-slate-500 font-light">Please wait for the next number...</p>
                </div>
            )}
          </div>
        </div>

        {/* Up Next Column */}
        <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-yellow-400 uppercase tracking-wider mb-6 pb-4 border-b border-slate-700">
            <i className="fas fa-list-ol mr-3"></i> Up Next
          </h2>
          <div className="space-y-4">
            {waiting.length > 0 ? waiting.map((token, index) => {
                 const doc = getDoctor(token.doctorId);
                 return (
                    <div key={token.id} className="flex justify-between items-center p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition border border-transparent hover:border-slate-600">
                        <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center font-bold text-sm text-slate-300">
                                {index + 1}
                            </span>
                            <span className="text-2xl font-bold font-mono">{token.number}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-300 font-bold">{doc?.name}</p>
                            <p className="text-xs text-primary">{doc?.specialization}</p>
                        </div>
                    </div>
                 )
            }) : (
                <p className="text-slate-500 text-center py-4">No patients waiting.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="relative z-10 mt-auto pt-6 text-center border-t border-slate-800">
         <p className="text-slate-500 text-sm">LM HEALTH QUEUE SYSTEM • POWERED BY AI</p>
      </div>
    </div>
  );
};

export default QueueDisplay;