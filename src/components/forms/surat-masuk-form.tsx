'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { suratMasukSchema } from '@/lib/schemas'
import { categoriesService, suratMasukService } from '@/lib/api/services'
import { useQuery } from '@tanstack/react-query'
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
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

// Form values type
type SuratMasukFormValues = {
  nomor_surat: string
  perihal: string
  pengirim: string
  tanggal: Date
  tanggal_diterima: Date
  keterangan?: string
  category_id: number
  file_path?: string
}

interface SuratMasukFormProps {
  initialData?: z.infer<typeof suratMasukSchema>
  isEdit?: boolean
}

export function SuratMasukForm({ initialData, isEdit = false }: SuratMasukFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  })

  // Initialize form with schema validation
  const form = useForm<SuratMasukFormValues>({
    resolver: zodResolver(
      z.object({
        nomor_surat: z.string().min(1, 'Nomor surat wajib diisi'),
        perihal: z.string().min(1, 'Perihal wajib diisi'),
        pengirim: z.string().min(1, 'Pengirim wajib diisi'),
        tanggal: z.date({ error: 'Tanggal wajib diisi' }),
        tanggal_diterima: z.date({ error: 'Tanggal diterima wajib diisi' }),
        keterangan: z.string().optional(),
        category_id: z
          .number({ error: 'Kategori wajib dipilih' })
          .min(1, 'Kategori wajib dipilih'),
        file_path: z.string().optional(),
      })
    ),
    defaultValues: {
      nomor_surat: '',
      perihal: '',
      pengirim: '',
      keterangan: '',
      file_path: '',
      category_id: 0,
    },
  })

  // Set form values when editing existing data
  useEffect(() => {
    if (initialData && isEdit) {
      form.reset({
        nomor_surat: initialData.nomor_surat,
        perihal: initialData.perihal,
        pengirim: initialData.pengirim ?? '',
        tanggal: new Date(initialData.tanggal),
        tanggal_diterima: new Date(initialData.tanggal_diterima),
        keterangan: initialData.keterangan ?? undefined,
        file_path: initialData.file_path ?? undefined,
        category_id: initialData.category_id,
      })
    }
  }, [initialData, isEdit, form])

  const onSubmit = async (values: SuratMasukFormValues) => {
    setIsSubmitting(true)
    try {
      const payload = {
        nomor_surat: values.nomor_surat,
        perihal: values.perihal,
        pengirim: values.pengirim,
        tanggal: values.tanggal.toISOString().split('T')[0],
        tanggal_diterima: values.tanggal_diterima.toISOString().split('T')[0],
        keterangan: values.keterangan?.trim() || undefined,
        file_path: values.file_path?.trim() || undefined,
        category_id: values.category_id,
      }

      if (isEdit && initialData) {
        await suratMasukService.update(initialData.id, payload)
        toast.success('Surat masuk berhasil diperbarui')
        router.push(`/surat-masuk/${initialData.id}`)
        router.refresh()
      } else {
        const result = await suratMasukService.create(payload)
        toast.success('Surat masuk berhasil dibuat')
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nomor_surat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Surat</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nomor surat" {...field} />
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
                <FormLabel>Kategori</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
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
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="perihal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Perihal</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan perihal surat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pengirim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pengirim</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama pengirim" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tanggal"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Surat</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: id })
                        ) : (
                          <span className="text-muted-foreground">Pilih tanggal</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tanggal_diterima"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Diterima</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: id })
                        ) : (
                          <span className="text-muted-foreground">Pilih tanggal</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="keterangan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Masukkan keterangan tambahan (opsional)"
                  className="min-h-32"
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
            <FormItem>
              <FormLabel>File Path (URL)</FormLabel>
              <FormControl>
                <Input placeholder="URL file dokumen (opsional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Perbarui' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
