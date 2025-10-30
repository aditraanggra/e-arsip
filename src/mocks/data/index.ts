import { faker } from '@faker-js/faker'
import type { User, Category, SuratMasuk, SuratKeluar, DashboardMetrics } from '@/lib/schemas'

// Mock user data
export const mockUser: User = {
  id: 1,
  name: 'Admin E-Arsip',
  email: 'admin@earsip.com',
  role: 'admin',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

// Mock categories data
export const mockCategories: Category[] = [
  { id: 1, name: 'Umum', desc: 'Surat umum' },
  { id: 2, name: 'Keuangan', desc: 'Keuangan' },
  { id: 3, name: 'Pendistribusian', desc: 'Distribusi' },
]

// Mock surat masuk data
export const mockSuratMasuk: SuratMasuk[] = [
  {
    id: 101,
    category_id: 1,
    no_agenda: '001/SEKRE/IX/2025',
    date_agenda: '2025-09-05',
    date_letter: '2025-09-03',
    sender: 'Kantor Camat',
    no_letter: '070/123/IX/2025',
    subject: 'Undangan Rapat',
    contact: '081234567890',
    address: 'Jl. Raya 1',
    file: 'undangan.pdf',
    dept_disposition: 'Sekretariat',
    desc_disposition: 'Mohon hadir',
    district: 'Cianjur',
    village: 'Muka',
    created_at: '2025-09-05T10:00:00Z',
    updated_at: '2025-09-05T10:00:00Z',
  },
  {
    id: 102,
    category_id: 3,
    no_agenda: '002/PD/IX/2025',
    date_agenda: '2025-09-07',
    date_letter: '2025-09-06',
    sender: 'UPZ Peuteuycondong',
    no_letter: 'UPZ/09/2025/02',
    subject: 'Permohonan Bantuan',
    contact: '085712345678',
    address: 'Kp. Janangga',
    file: 'permohonan.pdf',
    dept_disposition: 'Pendistribusian',
    desc_disposition: 'Survey lapangan',
    district: 'Cibeber',
    village: 'Peuteuycondong',
    created_at: '2025-09-07T14:30:00Z',
    updated_at: '2025-09-07T14:30:00Z',
  },
]

// Mock surat keluar data
export const mockSuratKeluar: SuratKeluar[] = [
  {
    id: 201,
    category_id: 2,
    date_letter: '2025-09-08',
    to_letter: 'Bank BJB',
    no_letter: 'BZN/KU/IX/2025/015',
    subject: 'Permintaan Rek Koran',
    file: 'permintaan.pdf',
    created_at: '2025-09-08T09:00:00Z',
    updated_at: '2025-09-08T09:00:00Z',
  },
  {
    id: 202,
    category_id: 1,
    date_letter: '2025-09-10',
    to_letter: 'Kecamatan Karangtengah',
    no_letter: 'BZN/UM/IX/2025/021',
    subject: 'Pemberitahuan Kegiatan',
    file: 'pemberitahuan.pdf',
    created_at: '2025-09-10T11:15:00Z',
    updated_at: '2025-09-10T11:15:00Z',
  },
]

// Generate additional mock data
export function generateMockSuratMasuk(count: number): SuratMasuk[] {
  return Array.from({ length: count }, (_, index) => ({
    id: 1000 + index,
    category_id: faker.helpers.arrayElement([1, 2, 3]),
    no_agenda: `${String(index + 1).padStart(3, '0')}/MOCK/${faker.date.recent().getFullYear()}`,
    date_agenda: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
    date_letter: faker.date.recent({ days: 35 }).toISOString().split('T')[0],
    sender: faker.company.name(),
    no_letter: `${faker.string.alphanumeric(3).toUpperCase()}/${faker.number.int({ min: 100, max: 999 })}/${faker.date.recent().getFullYear()}`,
    subject: faker.lorem.sentence(),
    contact: faker.phone.number(),
    address: faker.location.streetAddress(),
    file: `${faker.system.fileName()}.pdf`,
    dept_disposition: faker.helpers.arrayElement(['Sekretariat', 'Pendistribusian', 'Keuangan']),
    desc_disposition: faker.lorem.sentence(),
    district: faker.helpers.arrayElement(['Cianjur', 'Cibeber', 'Karangtengah']),
    village: faker.helpers.arrayElement(['Muka', 'Peuteuycondong', 'Janangga']),
    created_at: faker.date.recent({ days: 30 }).toISOString(),
    updated_at: faker.date.recent({ days: 30 }).toISOString(),
  }))
}

export function generateMockSuratKeluar(count: number): SuratKeluar[] {
  return Array.from({ length: count }, (_, index) => ({
    id: 2000 + index,
    category_id: faker.helpers.arrayElement([1, 2, 3]),
    date_letter: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
    to_letter: faker.company.name(),
    no_letter: `BZN/${faker.string.alphanumeric(2).toUpperCase()}/${faker.date.recent().getFullYear()}/${String(index + 1).padStart(3, '0')}`,
    subject: faker.lorem.sentence(),
    file: `${faker.system.fileName()}.pdf`,
    created_at: faker.date.recent({ days: 30 }).toISOString(),
    updated_at: faker.date.recent({ days: 30 }).toISOString(),
  }))
}

// Mock dashboard metrics
export const mockDashboardMetrics: DashboardMetrics = {
  total_surat_masuk: 156,
  total_surat_keluar: 89,
  surat_masuk_bulan_ini: 23,
  surat_keluar_bulan_ini: 15,
  chart_data: Array.from({ length: 30 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - index))
    return {
      date: date.toISOString().split('T')[0],
      surat_masuk: faker.number.int({ min: 0, max: 5 }),
      surat_keluar: faker.number.int({ min: 0, max: 3 }),
    }
  }),
}

// Combine all mock data
export const allMockSuratMasuk = [...mockSuratMasuk, ...generateMockSuratMasuk(50)]
export const allMockSuratKeluar = [...mockSuratKeluar, ...generateMockSuratKeluar(30)]
