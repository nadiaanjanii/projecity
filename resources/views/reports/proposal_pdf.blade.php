<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Manajemen Proposal Proyek - PT Central Saga Mandala</title>
    <style>
        /* HIDE BROWSER DEFAULT HEADER AND FOOTER */
        @page {
            size: A4 portrait;
            margin: 0;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
            background-color: #ffffff;
            font-size: 9pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Bar Kontrol Cetak (Web Preview Only) */
        .no-print-bar {
            background: #0f172a;
            color: #ffffff;
            padding: 10px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
            border-bottom: 2px solid #1e293b;
            position: sticky;
            top: 0;
            z-index: 999;
        }

        .btn-print {
            background: #047857;
            color: #ffffff;
            border: 1px solid #059669;
            padding: 7px 18px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 11px;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .btn-print:hover {
            background: #065f46;
        }

        /* AREA CETAK LAPORAN */
        .printable-content {
            position: relative;
            padding: 12mm 14mm 16mm 14mm;
            width: 100%;
            min-height: 297mm;
            background-color: #ffffff;
            box-sizing: border-box;
            overflow: hidden;
        }

        /* ORNAMEN DEKORASI VECTOR HIJAU KOP & FOOTER (LEKUKAN RESMI PT) */
        .header-wave-decoration {
            position: absolute;
            top: 0;
            left: 0;
            width: 440px;
            height: 180px;
            pointer-events: none;
            z-index: 1;
        }

        .footer-wave-decoration {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 420px;
            height: 180px;
            pointer-events: none;
            z-index: 1;
        }

        /* KOP SURAT TABLE */
        .kop-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            margin-bottom: 20px;
            position: relative;
            z-index: 2;
        }

        /* DOKUMEN HEADER INFO */
        .doc-header {
            text-align: center;
            margin-bottom: 16px;
            position: relative;
            z-index: 2;
        }

        .doc-header h3 {
            font-size: 11.5pt;
            font-weight: 800;
            text-transform: uppercase;
            margin: 0 0 3px 0;
            letter-spacing: 0.6px;
            color: #0f172a;
        }

        .doc-no {
            font-size: 8.5pt;
            color: #475569;
            font-weight: 600;
        }

        /* METADATA CARD (ELEGANT GREEN TOUCH) */
        .meta-card {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 18px;
            position: relative;
            z-index: 2;
        }

        .meta-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
        }

        .meta-table td {
            padding: 3px 2px;
            vertical-align: top;
        }

        .meta-label {
            font-weight: 700;
            color: #166534;
            width: 16%;
            text-transform: uppercase;
            font-size: 7.5pt;
            letter-spacing: 0.4px;
        }

        .meta-sep {
            width: 2%;
            text-align: center;
            color: #86efac;
        }

        .meta-val {
            width: 32%;
            color: #0f172a;
            font-weight: 600;
        }

        /* TABEL DATA UTAMA */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
            font-size: 8.5pt;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
            z-index: 2;
        }

        .data-table th {
            background-color: #047857 !important;
            color: #ffffff !important;
            font-weight: 700;
            text-transform: uppercase;
            text-align: center;
            padding: 9px 8px;
            font-size: 7.5pt;
            letter-spacing: 0.5px;
            border-right: 1px solid #059669;
        }

        .data-table th:last-child {
            border-right: none;
        }

        .data-table td {
            border-bottom: 1px solid #e2e8f0;
            border-right: 1px solid #f1f5f9;
            padding: 9px 8px;
            vertical-align: middle;
        }

        .data-table td:last-child {
            border-right: none;
        }

        .data-table tbody tr {
            page-break-inside: avoid;
        }

        .data-table tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }

        .proposal-title {
            font-weight: 700;
            color: #0f172a;
            font-size: 8.5pt;
            margin-bottom: 2px;
        }

        .proposal-author {
            font-size: 7.5pt;
            color: #64748b;
        }

        .badge-status {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 7.5pt;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .badge-verified {
            background-color: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
        }

        .badge-pending {
            background-color: #fffbeb;
            color: #b45309;
            border: 1px solid #fde68a;
        }

        .badge-rejected {
            background-color: #fef2f2;
            color: #b91c1c;
            border: 1px solid #fca5a5;
        }

        .text-center { text-align: center; }
        .text-right { text-align: right; }

        /* RINGKASAN DATA */
        .summary-box {
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 24px;
            font-size: 8.5pt;
            background-color: #f0fdf4;
            color: #334155;
            position: relative;
            z-index: 2;
        }

        .summary-title {
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 4px;
            display: block;
            color: #166534;
            font-size: 8pt;
            letter-spacing: 0.4px;
        }

        .summary-item {
            display: inline-block;
            margin-right: 16px;
        }

        .summary-item strong {
            color: #0f172a;
        }

        /* LEMBAR PENGESAHAN */
        .pengesahan-container {
            width: 100%;
            margin-top: 24px;
            page-break-inside: avoid;
            position: relative;
            z-index: 2;
        }

        .pengesahan-table {
            width: 100%;
            border-collapse: collapse;
        }

        .pengesahan-table td {
            width: 50%;
            vertical-align: top;
            font-size: 8.5pt;
            text-align: center;
        }

        .signature-space {
            height: 55px;
        }

        .signature-name {
            font-weight: 700;
            color: #0f172a;
            text-decoration: underline;
            margin: 0 0 2px 0;
            font-size: 9pt;
        }

        .nip-info {
            font-size: 8pt;
            color: #64748b;
            margin: 0;
        }

        /* MEDIA PRINT OVERRIDES */
        @media print {
            .no-print-bar {
                display: none !important;
            }
            body {
                background: none;
            }
            .data-table th {
                background-color: #047857 !important;
                color: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .meta-card, .summary-box, .badge-status {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
    </style>
</head>
<body>

    <!-- Bar Kontrol Tampilan Web -->
    <div class="no-print-bar">
        <div>
            <strong>Laporan Manajemen Proposal Proyek</strong> — PT Central Saga Mandala
        </div>
        <div>
            <button onclick="window.print()" class="btn-print">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Cetak / Simpan Ke PDF
            </button>
        </div>
    </div>

    <!-- AREA CETAK LAPORAN -->
    <div class="printable-content">

        <!-- DEKORASI GELOMBANG HIJAU ATAS KIRI (DESAIN RESMI PT) -->
        <div class="header-wave-decoration">
            <svg viewBox="0 0 450 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                <path d="M -10 -10 H 420 C 330 35, 230 110, 120 150 C 40 170, -5 130, -10 100 Z" fill="#013822"/>
                <path d="M -10 -10 H 330 C 250 25, 160 90, 60 125 C 0 140, -8 105, -10 80 Z" fill="#047857"/>
                <path d="M -10 -10 H 230 C 170 20, 95 70, 10 95 C -5 100, -8 80, -10 60 Z" fill="#059669"/>
            </svg>
        </div>

        <!-- DEKORASI GELOMBANG HIJAU BAWAH KANAN (DESAIN RESMI PT) -->
        <div class="footer-wave-decoration">
            <svg viewBox="0 0 420 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                <path d="M 430 210 V -10 C 330 40, 210 110, 50 210 Z" fill="#013822"/>
                <path d="M 430 210 V 40 C 340 80, 240 140, 120 210 Z" fill="#047857"/>
                <path d="M 430 210 V 90 C 360 115, 280 160, 190 210 Z" fill="#059669"/>
            </svg>
        </div>

        <!-- KOP SURAT RESMI PT CENTRAL SAGA MANDALA (ALIGNED RIGHT WITH LOGO) -->
        <table class="kop-table">
            <tr>
                <!-- Spacer kiri untuk menghindari area gelombang -->
                <td style="width: 32%;"></td>
                <!-- Text info perusahaan di sebelah kanan -->
                <td style="text-align: right; vertical-align: middle; padding-right: 14px;">
                    <div style="font-size: 15pt; font-weight: 800; color: #047857; letter-spacing: 0.5px; text-transform: uppercase; line-height: 1.2;">
                        PT. CENTRAL SAGA MANDALA
                    </div>
                    <div style="font-size: 8.5pt; font-weight: 700; color: #0f172a; letter-spacing: 0.8px; text-transform: uppercase; margin-top: 2px; margin-bottom: 3px;">
                        SOFTWARE HOUSE & CREATIVE AGENCY
                    </div>
                    <div style="font-size: 8pt; color: #475569; margin: 0; line-height: 1.3;">
                        +62 851-1732-7700
                    </div>
                    <div style="font-size: 8pt; color: #475569; margin: 0; line-height: 1.3;">
                        Jl. Timbul, No. 28, Tabanan, Bali, 82113
                    </div>
                </td>
                <!-- Logo perusahaan paling kanan -->
                <td style="width: 70px; vertical-align: middle; text-align: right;">
                    @if(!empty($logoBase64))
                        <img src="{{ $logoBase64 }}" alt="Logo PT Central Saga Mandala" style="width: 65px; height: 65px; object-fit: contain; display: block;" />
                    @else
                        <!-- Fallback Logo SVG Resmi PT Central Saga Mandala -->
                        <svg width="65" height="65" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100" height="100" rx="20" fill="#047857"/>
                            <path d="M50 20 C 33.4 20, 20 33.4, 20 50 C 20 66.6, 33.4 80, 50 80 C 66.6 80, 80 66.6, 80 50 C 80 40, 75 32, 67 27 L 60 35 C 65 38, 68 44, 68 50 C 68 60, 60 68, 50 68 C 40 68, 32 60, 32 50 C 32 40, 40 32, 50 32 L 50 20 Z" fill="#ffffff"/>
                            <rect x="42" y="42" width="16" height="16" rx="3" fill="#10b981"/>
                        </svg>
                    @endif
                </td>
            </tr>
        </table>

        <!-- JUDUL DOKUMEN -->
        <div class="doc-header">
            <h3>LAPORAN MANAJEMEN PROPOSAL PROYEK</h3>
            <div class="doc-no">Nomor Dokumen: <strong>{{ $nomorSurat }}</strong></div>
        </div>

        <!-- INFORMASI METADATA CETAK -->
        <div class="meta-card">
            <table class="meta-table">
                <tr>
                    <td class="meta-label">Filter Divisi</td>
                    <td class="meta-sep">:</td>
                    <td class="meta-val">{{ $divisiText }}</td>
                    <td class="meta-label">Tanggal Cetak</td>
                    <td class="meta-sep">:</td>
                    <td class="meta-val">{{ \Carbon\Carbon::now()->translatedFormat('d F Y H:i') }} WITA</td>
                </tr>
                <tr>
                    <td class="meta-label">Status Filter</td>
                    <td class="meta-sep">:</td>
                    <td class="meta-val">{{ empty($filters['status']) || $filters['status'] === 'ALL' ? 'SEMUA STATUS' : strtoupper($filters['status']) }}</td>
                    <td class="meta-label">Pencetak Laporan</td>
                    <td class="meta-sep">:</td>
                    <td class="meta-val">{{ $user->name }} ({{ strtoupper($user->role) }})</td>
                </tr>
                <tr>
                    <td class="meta-label">Filter Layanan</td>
                    <td class="meta-sep">:</td>
                    <td class="meta-val">{{ $layananText }}</td>
                    <td class="meta-label">Rentang Waktu</td>
                    <td class="meta-sep">:</td>
                    <td class="meta-val">
                        {{ !empty($filters['date_from']) ? \Carbon\Carbon::parse($filters['date_from'])->translatedFormat('d M Y') : 'Awal Sistem' }} 
                        s/d 
                        {{ !empty($filters['date_to']) ? \Carbon\Carbon::parse($filters['date_to'])->translatedFormat('d M Y') : 'Sekarang' }}
                    </td>
                </tr>
            </table>
        </div>

        <!-- TABEL DATA UTAMA -->
        <table class="data-table">
            <thead>
                <tr>
                    <th width="4%">NO</th>
                    <th width="30%">JUDUL PROPOSAL & PENGAJU</th>
                    <th width="14%">DIVISI</th>
                    <th width="15%">LAYANAN</th>
                    <th width="14%">TANGGAL PENGAJUAN</th>
                    <th width="11%">STATUS</th>
                    <th width="12%">CATATAN / REVISI</th>
                </tr>
            </thead>
            <tbody>
                @forelse($proposals as $index => $item)
                    <tr>
                        <td class="text-center" style="font-weight: 600; color: #64748b;">{{ $index + 1 }}</td>
                        <td>
                            <div class="proposal-title">{{ $item->title }}</div>
                            <div class="proposal-author">Oleh: {{ $item->user->name ?? 'Pengguna' }} ({{ $item->user->email ?? '-' }})</div>
                        </td>
                        <td class="text-center" style="font-weight: 600; color: #1e293b;">{{ strtoupper($item->division ?? '-') }}</td>
                        <td class="text-center" style="color: #475569;">{{ $item->category ?? 'Umum' }}</td>
                        <td class="text-center" style="color: #334155; font-size: 8pt;">
                            {{ \Carbon\Carbon::parse($item->created_at)->translatedFormat('d M Y, H:i') }}
                        </td>
                        <td class="text-center">
                            @if($item->status === 'VERIFIED')
                                <span class="badge-status badge-verified">DISETUJUI</span>
                            @elseif($item->status === 'PENDING')
                                <span class="badge-status badge-pending">MENUNGGU</span>
                            @else
                                <span class="badge-status badge-rejected">REVISI</span>
                            @endif
                        </td>
                        <td style="font-size: 8pt; color: #475569;">
                            {{ Str::limit($item->rejection_reason ?? ($item->notes ?? '-'), 65) }}
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center" style="padding: 24px; font-style: italic; color: #64748b;">
                            Tidak ada data proposal yang sesuai dengan kriteria filter pencarian.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <!-- RINGKASAN DATA METRIK -->
        <div class="summary-box">
            <span class="summary-title">RINGKASAN METRIK REKAPITULASI PROPOSAL:</span>
            <div class="summary-item">Total Proposal: <strong>{{ $proposals->count() }}</strong></div>
            <div class="summary-item">Disetujui: <strong style="color: #047857;">{{ $proposals->where('status', 'VERIFIED')->count() }}</strong></div>
            <div class="summary-item">Menunggu Verifikasi: <strong style="color: #b45309;">{{ $proposals->where('status', 'PENDING')->count() }}</strong></div>
            <div class="summary-item">Perlu Revisi: <strong style="color: #b91c1c;">{{ $proposals->where('status', 'REJECTED')->count() }}</strong></div>
        </div>

        <!-- LEMBAR PENGESAHAN -->
        <div class="pengesahan-container">
            <table class="pengesahan-table">
                <tr>
                    <td>
                        <p style="margin-bottom: 2px;">&nbsp;</p>
                        <p style="margin-top: 0; margin-bottom: 2px;">Hormat kami,</p>
                        <p style="margin-top: 0; margin-bottom: 2px; font-weight: 700; color: #047857;">PT Central Saga Mandala</p>
                        <div class="signature-space"></div>
                        <p class="signature-name">I Putu Wira Budhi Guna Ariyasa, S. Kom</p>
                        <p style="margin: 0; font-size: 8.5pt; color: #475569; font-weight: 600;">Chief Executive Officer</p>
                    </td>
                    <td>
                        <p style="margin-bottom: 2px;">Tabanan, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
                        <p style="margin-top: 0; margin-bottom: 2px;">Mengetahui,</p>
                        <p style="margin-top: 0; margin-bottom: 2px; font-weight: 700; color: #0f172a;">Manajer Penanggung Jawab Proyek</p>
                        <div class="signature-space"></div>
                        <p class="signature-name">{{ strtoupper($user->name) }}</p>
                        <p style="margin: 0; font-size: 8.5pt; color: #475569; font-weight: 600;">Manager Utama</p>
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
