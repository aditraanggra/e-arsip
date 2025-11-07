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

const getCategorySnapshot = (id: number) => {
  const category = mockCategories.find((cat) => cat.id === id) ?? mockCategories[0]
  return { id: category.id, name: category.name }
}

// Mock surat masuk data
export const mockSuratMasuk: SuratMasuk[] = [
  {
    id: 101,
    nomor_surat: '001/SEKRE/IX/2025',
    perihal: 'Undangan Rapat Koordinasi',
    pengirim: 'Kantor Camat',
    tanggal: '2025-09-03T00:00:00+07:00',
    tanggal_diterima: '2025-09-05T00:00:00+07:00',
    keterangan: 'Mohon hadir tepat waktu dengan membawa dokumen pendukung.',
    file_path: 'https://example.com/files/undangan-rapat.pdf',
    category_id: 1,
    category: getCategorySnapshot(1),
    no_agenda: 'AGD-2025-001',
    district: 'Cianjur',
    village: 'Peuteuycondong',
    contact: '021-555123',
    address: 'Jl. Raya Cianjur No. 12',
    dept_disposition: 'Sekretariat',
    desc_disposition: 'Koordinasikan peserta rapat.',
    created_at: '2025-09-05T10:00:00Z',
    updated_at: '2025-09-05T10:00:00Z',
  },
  {
    id: 102,
    nomor_surat: '002/PD/IX/2025',
    perihal: 'Permohonan Bantuan Pendistribusian',
    pengirim: 'UPZ Peuteuycondong',
    tanggal: '2025-09-06T00:00:00+07:00',
    tanggal_diterima: '2025-09-07T00:00:00+07:00',
    keterangan: 'Mohon dilakukan survey lapangan sebelum penyaluran.',
    file_path: 'https://example.com/files/permohonan-bantuan.pdf',
    category_id: 3,
    category: getCategorySnapshot(3),
    no_agenda: 'AGD-2025-002',
    district: 'Warungkondang',
    village: 'Sukamaju',
    contact: '0857-1234-5678',
    address: 'Kp. Sukamaju RT 04/02',
    dept_disposition: 'Pendayagunaan',
    desc_disposition: 'Survey lokasi dan laporkan hasilnya.',
    created_at: '2025-09-07T14:30:00Z',
    updated_at: '2025-09-07T14:30:00Z',
  },
]

// Mock surat keluar data
export const mockSuratKeluar: SuratKeluar[] = [
  {
    id: 201,
    nomor_surat: 'BZN/KU/IX/2025/015',
    perihal: 'Permintaan Rekening Koran Bank BJB',
    tujuan: 'Bank BJB',
    tanggal: '2025-09-08',
    keterangan: 'Diharapkan rekaman transaksi bulan berjalan.',
    file_path: 'https://example.com/files/permintaan-rekkoran.pdf',
    file: 'permintaan-rekkoran.pdf',
    category_id: 2,
    category: getCategorySnapshot(2),
    created_at: '2025-09-08T09:00:00Z',
    updated_at: '2025-09-08T09:00:00Z',
  },
  {
    id: 202,
    nomor_surat: 'BZN/UM/IX/2025/021',
    perihal: 'Pemberitahuan Kegiatan Sosialisasi',
    tujuan: 'Kecamatan Karangtengah',
    tanggal: '2025-09-10',
    keterangan: 'Harap mengirimkan perwakilan untuk kegiatan sosialisasi.',
    file_path: 'https://example.com/files/pemberitahuan-kegiatan.pdf',
    file: 'pemberitahuan-kegiatan.pdf',
    category_id: 1,
    category: getCategorySnapshot(1),
    created_at: '2025-09-10T11:15:00Z',
    updated_at: '2025-09-10T11:15:00Z',
  },
]

// Generate additional mock data
export function generateMockSuratMasuk(count: number): SuratMasuk[] {
  return Array.from({ length: count }, (_, index) => {
    const tanggalSurat = faker.date.recent({ days: 45 })
    const tanggalDiterima = faker.date.soon({ days: 3, refDate: tanggalSurat })
    const category = faker.helpers.arrayElement(mockCategories)
    const fileName = `${faker.string.alphanumeric(8).toLowerCase()}.pdf`

    return {
      id: 1000 + index,
      nomor_surat: `${String(index + 1).padStart(3, '0')}/MOCK/${tanggalSurat.getFullYear()}`,
      perihal: faker.lorem.sentence(),
      pengirim: faker.company.name(),
      tanggal: tanggalSurat.toISOString(),
      tanggal_diterima: tanggalDiterima.toISOString(),
      keterangan: faker.lorem.sentence(),
      file_path: `https://example.com/files/${fileName}`,
      category_id: category.id,
      category: { id: category.id, name: category.name },
      no_agenda: `AGD-${tanggalSurat.getFullYear()}-${String(index + 10).padStart(3, '0')}`,
      district: faker.location.city(),
      village: faker.location.street(),
      contact: faker.phone.number(),
      address: faker.location.streetAddress(),
      dept_disposition: faker.helpers.arrayElement(['Sekretariat', 'Pendayagunaan', 'Keuangan']),
      desc_disposition: faker.lorem.sentence(),
      created_at: faker.date.recent({ days: 30 }).toISOString(),
      updated_at: faker.date.recent({ days: 30 }).toISOString(),
    }
  })
}

export function generateMockSuratKeluar(count: number): SuratKeluar[] {
  return Array.from({ length: count }, (_, index) => {
    const tanggalSurat = faker.date.recent({ days: 45 })
    const category = faker.helpers.arrayElement(mockCategories)
    const fileName = `${faker.string.alphanumeric(8).toLowerCase()}.pdf`

    return {
      id: 2000 + index,
      nomor_surat: `BZN/${faker.string.alphanumeric(2).toUpperCase()}/${tanggalSurat.getFullYear()}/${String(index + 1).padStart(3, '0')}`,
      perihal: faker.lorem.sentence(),
      tujuan: faker.company.name(),
      tanggal: tanggalSurat.toISOString().split('T')[0],
      keterangan: faker.lorem.sentence(),
      file_path: `https://example.com/files/${fileName}`,
      file: fileName,
      category_id: category.id,
      category: { id: category.id, name: category.name },
      created_at: faker.date.recent({ days: 30 }).toISOString(),
      updated_at: faker.date.recent({ days: 30 }).toISOString(),
    }
  })
}

// Mock dashboard metrics
export const mockDashboardMetrics: DashboardMetrics = {
  total_surat_masuk: 156,
  total_surat_keluar: 89,
  bulan_ini: {
    surat_masuk: 23,
    surat_keluar: 15,
    total: 38,
  },
  hari_ini: {
    surat_masuk: 2,
    surat_keluar: 1,
    total: 3,
  },
  harian_30_hari: Array.from({ length: 30 }, (_, index) => {
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
