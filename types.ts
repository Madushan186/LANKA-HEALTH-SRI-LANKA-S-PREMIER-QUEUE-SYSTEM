export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';
export type Language = 'EN' | 'SI' | 'TA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string; // 07X format
}

export interface Doctor extends User {
  specialization: string;
  availability: string;
  roomNumber: string;
  slmcNumber: string; // Sri Lanka Medical Council
  consultationFee: number; // LKR
}

export interface Patient extends User {
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  nic: string; // National Identity Card
  district: string; // SL District
  emergencyContact: string;
  medicalHistoryIds: string[];
}

export type AppointmentStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  hospitalType: 'Government' | 'Private';
  queueToken?: string;
}

export type TokenStatus = 'WAITING' | 'SERVING' | 'FINISHED';

export interface QueueToken {
  id: string;
  number: string; // SLDOC-{id}-{num}
  appointmentId: string;
  doctorId: string;
  status: TokenStatus;
  created_at: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  diagnosis: string;
  medications: string[];
  notes: string;
  date: string;
}

export interface Invoice {
  id: string;
  appointmentId: string;
  patientId: string;
  consultationFee: number;
  medicineCharge: number;
  totalAmount: number;
  status: 'PAID' | 'UNPAID';
  date: string;
}

export interface DashboardStats {
  totalPatients: number;
  activeDoctors: number;
  todaysAppointments: number;
  pendingRequests: number;
}