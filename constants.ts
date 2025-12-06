import { Doctor, Patient, Appointment, QueueToken, User, Invoice } from './types';

export const SL_DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle"
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: '12',
    name: 'Dr. Lakshitha Perera',
    email: 'lakshitha@lmhealth.lk',
    role: 'DOCTOR',
    specialization: 'Cardiologist',
    availability: '08:00 - 16:00',
    roomNumber: '101',
    slmcNumber: 'SLMC-4521',
    consultationFee: 2500,
    avatar: 'https://picsum.photos/100/100?random=1'
  },
  {
    id: '14',
    name: 'Dr. Kavindi Silva',
    email: 'kavindi@lmhealth.lk',
    role: 'DOCTOR',
    specialization: 'Paediatrician',
    availability: '09:00 - 17:00',
    roomNumber: '102',
    slmcNumber: 'SLMC-3321',
    consultationFee: 2000,
    avatar: 'https://picsum.photos/100/100?random=2'
  },
  {
    id: '18',
    name: 'Dr. Nimal Rajapakshe',
    email: 'nimal@lmhealth.lk',
    role: 'DOCTOR',
    specialization: 'General Practitioner',
    availability: '10:00 - 18:00',
    roomNumber: '103',
    slmcNumber: 'SLMC-1198',
    consultationFee: 1500,
    avatar: 'https://picsum.photos/100/100?random=3'
  }
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Kasun Bandara',
    email: 'kasun@gmail.com',
    role: 'PATIENT',
    age: 35,
    gender: 'Male',
    nic: '198812345678',
    district: 'Colombo',
    phone: '0771234567',
    emergencyContact: '0719876543',
    medicalHistoryIds: [],
    avatar: 'https://picsum.photos/100/100?random=4'
  },
  {
    id: 'p2',
    name: 'Dilini Fernando',
    email: 'dilini@gmail.com',
    role: 'PATIENT',
    age: 28,
    gender: 'Female',
    nic: '199556789123',
    district: 'Gampaha',
    phone: '0701122334',
    emergencyContact: '0755566778',
    medicalHistoryIds: [],
    avatar: 'https://picsum.photos/100/100?random=5'
  }
];

export const MOCK_ADMIN: User = {
  id: 'a1',
  name: 'System Admin',
  email: 'admin@lmhealth.lk',
  role: 'ADMIN',
  avatar: 'https://picsum.photos/100/100?random=6'
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt1',
    patientId: 'p1',
    doctorId: '12',
    patientName: 'Kasun Bandara',
    doctorName: 'Dr. Lakshitha Perera',
    date: '2023-10-27',
    time: '09:30',
    reason: 'Chest pain checkup',
    status: 'APPROVED',
    hospitalType: 'Private',
    queueToken: 'SLDOC-12-001'
  },
  {
    id: 'appt2',
    patientId: 'p2',
    doctorId: '18',
    patientName: 'Dilini Fernando',
    doctorName: 'Dr. Nimal Rajapakshe',
    date: '2023-10-27',
    time: '10:00',
    reason: 'Fever and cold',
    status: 'PENDING',
    hospitalType: 'Private'
  }
];

export const INITIAL_QUEUE: QueueToken[] = [
  {
    id: 'q1',
    number: 'SLDOC-12-001',
    appointmentId: 'appt1',
    doctorId: '12',
    status: 'SERVING',
    created_at: new Date().toISOString()
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2023-001',
    appointmentId: 'appt1',
    patientId: 'p1',
    consultationFee: 2500,
    medicineCharge: 1200,
    totalAmount: 3700,
    status: 'UNPAID',
    date: '2023-10-27'
  }
];