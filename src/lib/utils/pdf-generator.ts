/**
 * PDF Generator untuk Laporan E-Arsip
 * Generate PDF dengan chart dan tabel informatif
 */

export type ReportData = {
    title: string
    period: string
    generatedAt: string
    summary: string
    totalSuratMasuk: number
    totalSuratKeluar: number
    chartData: Array<{
        date: string
        surat_masuk: number
        surat_keluar: number
    }>
    filters: {
        entity: string
        periodType: string
        month?: string
        year: string
    }
}

// Color definitions (RGB 0-1 scale)
const COLORS = {
    primary: { r: 0.19, g: 0.51, b: 0.78 }, // Blue #3182CE
    secondary: { r: 0.22, g: 0.63, b: 0.41 }, // Green #38A169
    text: { r: 0.2, g: 0.2, b: 0.2 },
    lightGray: { r: 0.9, g: 0.9, b: 0.9 },
    mediumGray: { r: 0.6, g: 0.6, b: 0.6 },
}

export function generateReportPDF(data: ReportData): Blob {
    const {
        title,
        period,
        generatedAt,
        summary,
        totalSuratMasuk,
        totalSuratKeluar,
        chartData,
        filters,
    } = data

    const lines: string[] = []
    let yPosition = 760

    // Helper functions
    const setColor = (color: { r: number; g: number; b: number }, fill = true) => {
        if (fill) {
            lines.push(`${color.r} ${color.g} ${color.b} rg`)
        } else {
            lines.push(`${color.r} ${color.g} ${color.b} RG`)
        }
    }

    const addText = (
        text: string,
        x: number,
        y: number,
        fontSize = 12,
        isBold = false
    ) => {
        const fontName = isBold ? '/F2' : '/F1'
        lines.push(
            `BT ${fontName} ${fontSize} Tf ${x} ${y} Td (${escapeText(text)}) Tj ET`
        )
    }

    const addRect = (
        x: number,
        y: number,
        width: number,
        height: number,
        fill = true
    ) => {
        lines.push(`${x} ${y} ${width} ${height} re ${fill ? 'f' : 'S'}`)
    }

    const addLine = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        lineWidth = 0.5
    ) => {
        lines.push(`${lineWidth} w ${x1} ${y1} m ${x2} ${y2} l S`)
    }

    function escapeText(text: string): string {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
    }

    // ===== HEADER SECTION =====
    // Header background
    setColor({ r: 0.16, g: 0.5, b: 0.73 })
    addRect(0, 770, 612, 30, true)

    // Header text
    setColor({ r: 1, g: 1, b: 1 })
    addText('LAPORAN ARSIP SURAT - E-ARSIP', 50, 780, 16, true)

    // Title and info
    yPosition = 740
    setColor(COLORS.text)
    addText(title, 50, yPosition, 18, true)
    yPosition -= 25

    addText(`Periode: ${period}`, 50, yPosition, 11)
    yPosition -= 15
    addText(`Tanggal Cetak: ${generatedAt}`, 50, yPosition, 11)
    yPosition -= 15

    const entityLabel =
        filters.entity === 'all'
            ? 'Semua Surat'
            : filters.entity === 'incoming'
                ? 'Surat Masuk'
                : 'Surat Keluar'
    addText(`Jenis Laporan: ${entityLabel}`, 50, yPosition, 11)
    yPosition -= 30

    // ===== SUMMARY CARDS =====
    // Card 1: Surat Masuk
    setColor(COLORS.lightGray)
    addRect(50, yPosition - 50, 160, 60, true)
    setColor(COLORS.primary)
    addRect(50, yPosition - 50, 5, 60, true)
    setColor(COLORS.text)
    addText('Surat Masuk', 65, yPosition - 10, 10)
    addText(String(totalSuratMasuk), 65, yPosition - 35, 24, true)

    // Card 2: Surat Keluar
    setColor(COLORS.lightGray)
    addRect(225, yPosition - 50, 160, 60, true)
    setColor(COLORS.secondary)
    addRect(225, yPosition - 50, 5, 60, true)
    setColor(COLORS.text)
    addText('Surat Keluar', 240, yPosition - 10, 10)
    addText(String(totalSuratKeluar), 240, yPosition - 35, 24, true)

    // Card 3: Total
    setColor(COLORS.lightGray)
    addRect(400, yPosition - 50, 160, 60, true)
    setColor({ r: 0.5, g: 0.5, b: 0.5 })
    addRect(400, yPosition - 50, 5, 60, true)
    setColor(COLORS.text)
    addText('Total Surat', 415, yPosition - 10, 10)
    addText(String(totalSuratMasuk + totalSuratKeluar), 415, yPosition - 35, 24, true)

    yPosition -= 80

    // ===== STATISTIK SECTION =====
    addText('STATISTIK', 50, yPosition, 12, true)
    yPosition -= 25

    // Calculate statistics
    const totalSurat = totalSuratMasuk + totalSuratKeluar
    const persenMasuk = totalSurat > 0 ? ((totalSuratMasuk / totalSurat) * 100).toFixed(1) : '0'
    const persenKeluar = totalSurat > 0 ? ((totalSuratKeluar / totalSurat) * 100).toFixed(1) : '0'
    const jumlahHari = chartData.length || 1
    const rataRataMasuk = (totalSuratMasuk / jumlahHari).toFixed(1)
    const rataRataKeluar = (totalSuratKeluar / jumlahHari).toFixed(1)

    // Find peak day
    let hariTerbanyak = '-'
    let maxTotal = 0
    chartData.forEach((d) => {
        const dayTotal = d.surat_masuk + d.surat_keluar
        if (dayTotal > maxTotal) {
            maxTotal = dayTotal
            hariTerbanyak = d.date
        }
    })

    // Statistics table
    const statsData = [
        ['Persentase Surat Masuk', `${persenMasuk}%`],
        ['Persentase Surat Keluar', `${persenKeluar}%`],
        ['Rata-rata Surat Masuk/Hari', rataRataMasuk],
        ['Rata-rata Surat Keluar/Hari', rataRataKeluar],
        ['Jumlah Hari Data', String(jumlahHari)],
        ['Hari dengan Surat Terbanyak', `${hariTerbanyak} (${maxTotal} surat)`],
    ]

    // Draw stats table
    statsData.forEach((row, index) => {
        // Alternate row background
        if (index % 2 === 0) {
            setColor({ r: 0.95, g: 0.97, b: 1 })
            addRect(50, yPosition - 12, 510, 18, true)
        }

        setColor(COLORS.text)
        addText(row[0], 60, yPosition - 8, 10)
        addText(row[1], 400, yPosition - 8, 10, true)
        yPosition -= 18
    })

    yPosition -= 15

    // ===== DATA TABLE SECTION =====
    addText('DETAIL DATA', 50, yPosition, 12, true)
    yPosition -= 20

    // Table header background
    setColor(COLORS.lightGray)
    addRect(50, yPosition - 15, 510, 18, true)

    // Table header text
    setColor(COLORS.text)
    const colPositions = [55, 180, 300, 420]
    addText('Tanggal', colPositions[0], yPosition - 10, 10, true)
    addText('Surat Masuk', colPositions[1], yPosition - 10, 10, true)
    addText('Surat Keluar', colPositions[2], yPosition - 10, 10, true)
    addText('Total', colPositions[3], yPosition - 10, 10, true)

    yPosition -= 20

    // Table rows
    const rowsToShow = chartData.slice(0, 10) // Show max 10 rows
    rowsToShow.forEach((row, index) => {
        if (yPosition < 80) return

        // Alternate row background
        if (index % 2 === 0) {
            setColor({ r: 0.97, g: 0.97, b: 0.97 })
            addRect(50, yPosition - 12, 510, 15, true)
        }

        setColor(COLORS.text)
        const total = row.surat_masuk + row.surat_keluar
        addText(row.date, colPositions[0], yPosition - 8, 9)
        addText(String(row.surat_masuk), colPositions[1], yPosition - 8, 9)
        addText(String(row.surat_keluar), colPositions[2], yPosition - 8, 9)
        addText(String(total), colPositions[3], yPosition - 8, 9)

        yPosition -= 15
    })

    // Table border
    setColor(COLORS.mediumGray)
    addLine(50, yPosition, 560, yPosition, 0.5)

    // ===== SUMMARY TEXT =====
    yPosition -= 25
    if (yPosition > 100) {
        addText('RINGKASAN', 50, yPosition, 11, true)
        yPosition -= 15

        const summaryLines = wrapText(summary, 90)
        summaryLines.slice(0, 3).forEach((line) => {
            if (yPosition > 70) {
                setColor(COLORS.text)
                addText(line, 50, yPosition, 9)
                yPosition -= 12
            }
        })
    }

    // ===== FOOTER =====
    setColor(COLORS.mediumGray)
    addLine(50, 55, 560, 55, 0.5)
    addText(
        'Dokumen ini digenerate otomatis oleh sistem E-Arsip',
        50,
        42,
        8
    )
    addText('Halaman 1 dari 1', 480, 42, 8)

    // Build PDF
    const contentStream = lines.join('\n')
    const pdf = buildPDF(contentStream)

    return new Blob([pdf.buffer as ArrayBuffer], { type: 'application/pdf' })
}

function wrapText(text: string, maxChars: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach(word => {
        if ((currentLine + ' ' + word).length > maxChars) {
            if (currentLine) lines.push(currentLine)
            currentLine = word
        } else {
            currentLine = currentLine ? currentLine + ' ' + word : word
        }
    })
    if (currentLine) lines.push(currentLine)

    return lines
}

function buildPDF(contentStream: string): Uint8Array {
    const encoder = new TextEncoder()
    const chunks: Uint8Array[] = []
    let byteOffset = 0

    // Helper to add chunk and track byte offset
    const addChunk = (str: string): number => {
        const startOffset = byteOffset
        const encoded = encoder.encode(str)
        chunks.push(encoded)
        byteOffset += encoded.length
        return startOffset
    }

    // PDF header with binary marker
    addChunk('%PDF-1.4\n')
    chunks.push(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A])) // %âãÏÓ\n
    byteOffset += 6
    // Track object offsets for xref
    const offsets: number[] = []

    // Object 1: Catalog
    offsets.push(byteOffset)
    addChunk(`1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
`)

    // Object 2: Pages
    offsets.push(byteOffset)
    addChunk(`2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
`)

    // Object 3: Page
    offsets.push(byteOffset)
    addChunk(`3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj
`)

    // Object 4: Content stream
    const streamBytes = encoder.encode(contentStream)
    offsets.push(byteOffset)
    addChunk(`4 0 obj
<< /Length ${streamBytes.length} >>
stream
`)
    chunks.push(streamBytes)
    byteOffset += streamBytes.length
    addChunk(`
endstream
endobj
`)

    // Object 5: Font (Helvetica)
    offsets.push(byteOffset)
    addChunk(`5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>
endobj
`)

    // Object 6: Font Bold (Helvetica-Bold)
    offsets.push(byteOffset)
    addChunk(`6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>
endobj
`)

    // Cross-reference table
    const xrefOffset = byteOffset
    addChunk('xref\n')
    addChunk(`0 ${offsets.length + 1}\n`)
    addChunk('0000000000 65535 f \n')
    offsets.forEach(offset => {
        addChunk(`${String(offset).padStart(10, '0')} 00000 n \n`)
    })

    // Trailer
    addChunk('trailer\n')
    addChunk(`<< /Size ${offsets.length + 1} /Root 1 0 R >>\n`)
    addChunk('startxref\n')
    addChunk(`${xrefOffset}\n`)
    addChunk('%%EOF')

    // Concatenate all chunks into final PDF
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let position = 0
    for (const chunk of chunks) {
        result.set(chunk, position)
        position += chunk.length
    }

    return result
}

export function formatPeriodLabel(
    periodType: string,
    month?: string,
    year?: string
): string {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    if (periodType === 'yearly') {
        return `Tahun ${year || new Date().getFullYear()}`
    }

    const monthIndex = month ? parseInt(month, 10) - 1 : new Date().getMonth()
    const monthName = months[monthIndex] || months[0]
    return `${monthName} ${year || new Date().getFullYear()}`
}
