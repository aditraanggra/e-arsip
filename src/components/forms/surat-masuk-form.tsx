'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { suratMasukSchema } from '@/lib/schemas'
import { categoriesService, suratMasukService } from '@/lib/api/services'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CalendarIcon, Loader2, Plus, Upload } from 'lucide-react'

const suratMasukFormSchema = z.object({
  no_agenda: z.string().min(1, 'No agenda wajib diisi'),
  nomor_surat: z.string().min(1, 'Nomor surat wajib diisi'),
  perihal: z.string().min(1, 'Perihal wajib diisi'),
  pengirim: z.string().min(1, 'Asal surat wajib diisi'),
  tanggal: z.string().min(1, 'Tanggal surat wajib diisi'),
  tanggal_diterima: z.string().min(1, 'Tanggal agenda wajib diisi'),
  keterangan: z.string().optional(),
  file_path: z.string().optional(),
  category_id: z.number().min(1, 'Jenis surat wajib dipilih'),
  district: z.string().min(1, 'Kecamatan wajib diisi'),
  village: z.string().optional(),
  contact: z.string().optional(),
  address: z.string().optional(),
  dept_disposition: z.string().optional(),
  desc_disposition: z.string().optional(),
})

type SuratMasukFormValues = z.infer<typeof suratMasukFormSchema>

interface SuratMasukFormProps {
  initialData?: z.infer<typeof suratMasukSchema>
  isEdit?: boolean
}

const defaultValues: SuratMasukFormValues = {
  no_agenda: '',
  nomor_surat: '',
  perihal: '',
  pengirim: '',
  tanggal: '',
  tanggal_diterima: '',
  keterangan: '',
  file_path: '',
  category_id: 0,
  district: '',
  village: '',
  contact: '',
  address: '',
  dept_disposition: '',
  desc_disposition: '',
}

const formatDateInput = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function SuratMasukForm({ initialData, isEdit = false }: SuratMasukFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitIntent, setSubmitIntent] = useState<'create' | 'create-new'>('create')
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  })

  const form = useForm<SuratMasukFormValues>({
    resolver: zodResolver(suratMasukFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        no_agenda:
          initialData.no_agenda !== null &&
          initialData.no_agenda !== undefined
            ? String(initialData.no_agenda)
            : '',
        nomor_surat: initialData.nomor_surat,
        perihal: initialData.perihal,
        pengirim: initialData.pengirim ?? '',
        tanggal: formatDateInput(initialData.tanggal),
        tanggal_diterima: formatDateInput(initialData.tanggal_diterima),
        keterangan: initialData.keterangan ?? '',
        file_path: initialData.file_path ?? '',
        category_id: initialData.category_id,
        district: initialData.district ?? '',
        village: initialData.village ?? '',
        contact: initialData.contact ?? '',
        address: initialData.address ?? '',
        dept_disposition: initialData.dept_disposition ?? '',
        desc_disposition: initialData.desc_disposition ?? '',
      })
    }
  }, [initialData, form])

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) {
      toast.error('Nama kategori wajib diisi')
      return
    }

    setIsCreatingCategory(true)
    try {
      const created = await categoriesService.create({
        name,
        desc: newCategoryDesc.trim() || undefined,
      })
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      form.setValue('category_id', created.id)
      toast.success('Kategori berhasil dibuat')
      setIsCategoryDialogOpen(false)
      setNewCategoryName('')
      setNewCategoryDesc('')
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Gagal membuat kategori'
      toast.error(message || 'Gagal membuat kategori')
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const onSubmit = async (values: SuratMasukFormValues) => {
    setIsSubmitting(true)
    try {
      const payload = {
        nomor_surat: values.nomor_surat,
        perihal: values.perihal,
        pengirim: values.pengirim,
        tanggal: values.tanggal,
        tanggal_diterima: values.tanggal_diterima,
        keterangan: values.keterangan?.trim() || undefined,
        file_path: values.file_path?.trim() || undefined,
        category_id: values.category_id,
        no_agenda: values.no_agenda.trim(),
        district: values.district.trim(),
        village: values.village?.trim() || undefined,
        contact: values.contact?.trim() || undefined,
        address: values.address?.trim() || undefined,
        dept_disposition: values.dept_disposition?.trim() || undefined,
        desc_disposition: values.desc_disposition?.trim() || undefined,
      }

      if (isEdit && initialData) {
        await suratMasukService.update(initialData.id, payload)
        toast.success('Surat masuk berhasil diperbarui')
        router.push(`/surat-masuk/${initialData.id}`)
        router.refresh()
      } else {
        const result = await suratMasukService.create(payload)
        toast.success('Surat masuk berhasil dibuat')

        if (submitIntent === 'create-new') {
          form.reset({ ...defaultValues, category_id: values.category_id })
          setSubmitIntent('create')
          return
        }

        router.push(`/surat-masuk/${result.id}`)
        router.refresh()
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan data'
      toast.error(message || 'Terjadi kesalahan saat menyimpan data')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-emerald-900">Agenda Surat</p>
            <p className="text-sm text-muted-foreground">Lengkapi informasi agenda surat masuk.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="no_agenda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No Agenda</FormLabel>
                  <FormControl>
                    <Input placeholder="Isi nomor agenda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <Dialog
                    open={isCategoryDialogOpen}
                    onOpenChange={(open) => {
                      setIsCategoryDialogOpen(open)
                      if (!open && !isCreatingCategory) {
                        setNewCategoryName('')
                        setNewCategoryDesc('')
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <FormLabel>Jenis Surat</FormLabel>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          title="Tambah jenis surat"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                    </div>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis surat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />

                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Tambah Jenis Surat</DialogTitle>
                        <DialogDescription>
                          Tambahkan kategori baru untuk mengelompokkan surat masuk.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <FormLabel>Nama Jenis Surat</FormLabel>
                          <Input
                            placeholder="Misal: Keuangan"
                            value={newCategoryName}
                            onChange={(event) => setNewCategoryName(event.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <FormLabel>Deskripsi (opsional)</FormLabel>
                          <Textarea
                            placeholder="Tambahkan deskripsi singkat kategori"
                            value={newCategoryDesc}
                            onChange={(event) => setNewCategoryDesc(event.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter className="gap-2 sm:gap-3">
                        <DialogClose asChild>
                          <Button type="button" variant="outline" disabled={isCreatingCategory}>
                            Batal
                          </Button>
                        </DialogClose>
                        <Button
                          type="button"
                          onClick={handleCreateCategory}
                          disabled={isCreatingCategory}
                        >
                          {isCreatingCategory && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Simpan Kategori
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tanggal_diterima"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Agenda</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="date"
                        className="pl-10"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tanggal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Surat</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="date"
                        className="pl-10"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-emerald-900">Detail Surat</p>
            <p className="text-sm text-muted-foreground">Informasi asal, kontak, dan isi surat.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="pengirim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asal Surat</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama instansi atau pengirim" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nomor_surat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No Surat</FormLabel>
                  <FormControl>
                    <Input placeholder="Nomor surat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No Kontak</FormLabel>
                  <FormControl>
                    <Input placeholder="Nomor telepon atau kontak lain" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder="Alamat lengkap pengirim" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kecamatan</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama kecamatan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desa</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama desa atau kelurahan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="perihal"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Perihal</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tuliskan perihal atau ringkasan isi surat"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file_path"
              render={({ field }) => (
                <FormItem className="md:col-span-2 space-y-3">
                  <FormLabel>Upload File</FormLabel>
                  <FormControl>
                    <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-emerald-200 bg-emerald-50/40 px-6 text-center transition hover:border-emerald-300 hover:bg-emerald-50">
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          field.onChange(file ? file.name : '')
                        }}
                      />
                      <Upload className="mb-3 h-8 w-8 text-emerald-600" />
                      <p className="text-sm font-medium text-emerald-900">Drag & Drop your files or Browse</p>
                      <p className="text-xs text-muted-foreground">Unggah dokumen pendukung (PDF/JPG/PNG)</p>
                      {field.value && (
                        <p className="mt-2 text-sm font-medium text-emerald-800">Dipilih: {field.value}</p>
                      )}
                    </label>
                  </FormControl>
                  <Input
                    placeholder="Atau tempel tautan dokumen"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-emerald-900">Disposisi Surat</p>
            <p className="text-sm text-muted-foreground">Catat arahan disposisi untuk surat ini.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="dept_disposition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disposisi Bagian</FormLabel>
                  <FormControl>
                    <Input placeholder="Bagian/Departemen tujuan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="desc_disposition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan Disposisi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instruksi atau catatan disposisi"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={() => setSubmitIntent('create')}
          >
            {isSubmitting && submitIntent === 'create' && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEdit ? 'Perbarui' : 'Create'}
          </Button>
          {!isEdit && (
            <Button
              type="submit"
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => setSubmitIntent('create-new')}
            >
              {isSubmitting && submitIntent === 'create-new' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create &amp; create another
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
