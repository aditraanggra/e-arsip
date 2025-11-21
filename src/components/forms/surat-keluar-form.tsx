'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesService, suratKeluarService } from '@/lib/api/services'
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

const suratKeluarFormSchema = z.object({
  category_id: z.number().min(1, 'Kategori surat wajib dipilih'),
  tanggal: z.string().min(1, 'Tanggal surat wajib diisi'),
  nomor_surat: z.string().min(1, 'Nomor surat wajib diisi'),
  tujuan: z.string().min(1, 'Tujuan surat wajib diisi'),
  perihal: z.string().min(1, 'Perihal wajib diisi'),
  file_path: z.string().optional(),
})

type SuratKeluarFormValues = z.infer<typeof suratKeluarFormSchema>

const defaultValues: SuratKeluarFormValues = {
  category_id: 0,
  tanggal: '',
  nomor_surat: '',
  tujuan: '',
  perihal: '',
  file_path: '',
}

export function SuratKeluarForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitIntent, setSubmitIntent] = useState<'create' | 'create-new'>('create')
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')

  const form = useForm<SuratKeluarFormValues>({
    resolver: zodResolver(suratKeluarFormSchema),
    defaultValues,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  })

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

  const onSubmit = async (values: SuratKeluarFormValues) => {
    setIsSubmitting(true)
    try {
      const payload = {
        category_id: values.category_id,
        tanggal: values.tanggal,
        nomor_surat: values.nomor_surat,
        tujuan: values.tujuan,
        perihal: values.perihal,
        file_path: values.file_path?.trim() || undefined,
        keterangan: undefined,
      }

      await suratKeluarService.create(payload)
      toast.success('Surat keluar berhasil dibuat')

      if (submitIntent === 'create-new') {
        form.reset({ ...defaultValues, category_id: values.category_id })
        setSubmitIntent('create')
        return
      }

      router.push('/surat-keluar')
      router.refresh()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Gagal menyimpan surat keluar'
      toast.error(message || 'Gagal menyimpan surat keluar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section className="space-y-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
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
                      <FormLabel>Kategori Surat</FormLabel>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          title="Tambah kategori"
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

                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Tambah Kategori Surat</DialogTitle>
                        <DialogDescription>
                          Buat kategori baru agar surat keluar lebih terorganisir.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <FormLabel>Nama Kategori</FormLabel>
                          <Input
                            placeholder="Misal: Keuangan"
                            value={newCategoryName}
                            onChange={(event) => setNewCategoryName(event.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <FormLabel>Deskripsi (opsional)</FormLabel>
                          <Textarea
                            placeholder="Tambahkan deskripsi singkat"
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
            <FormField
              control={form.control}
              name="tujuan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tujuan</FormLabel>
                  <FormControl>
                    <Input placeholder="Tujuan surat" {...field} />
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
                  <FormLabel>Nomor Surat</FormLabel>
                  <FormControl>
                    <Input placeholder="Nomor surat" {...field} />
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
                      <p className="text-sm font-medium text-emerald-900">
                        Drag & Drop your files or Browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Unggah dokumen pendukung (PDF/JPG/PNG)
                      </p>
                      {field.value && (
                        <p className="mt-2 text-sm font-medium text-emerald-800">
                          Dipilih: {field.value}
                        </p>
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

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={() => setSubmitIntent('create')}
          >
            {isSubmitting && submitIntent === 'create' && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create
          </Button>
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
