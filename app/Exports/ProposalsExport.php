<?php

namespace App\Exports;

use App\Models\Proposal;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

// FITUR: Ekspor laporan data proposal ke file Excel
class ProposalsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct($filters)
    {
        $this->filters = $filters;
    }

    // Ambil data proposal sesuai filter
    public function collection()
    {
        $query = Proposal::with('user');

        if (!empty($this->filters['division']) && $this->filters['division'] !== 'ALL') {
            $query->where('division', $this->filters['division']);
        }

        if (!empty($this->filters['status']) && $this->filters['status'] !== 'ALL') {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['category']) && $this->filters['category'] !== 'ALL') {
            $query->where('category', $this->filters['category']);
        }

        if (!empty($this->filters['date_from'])) {
            $query->where('created_at', '>=', $this->filters['date_from'] . ' 00:00:00');
        }

        if (!empty($this->filters['date_to'])) {
            $query->where('created_at', '<=', $this->filters['date_to'] . ' 23:59:59');
        }

        if (!empty($this->filters['search'])) {
            $s = $this->filters['search'];
            $query->where(function($q) use ($s) {
                $q->where('title', 'like', "%$s%")
                  ->orWhere('client_name', 'like', "%$s%");
            });
        }

        return $query->latest()->get();
    }

    // Coding baris judul header laporan excel
    public function headings(): array
    {
        return [
            'ID',
            'Judul Proposal',
            'Nama Klien',
            'Divisi',
            'Status',
            'Pengunggah',
            'Tanggal Dibuat',
        ];
    }

    // Coding pemetaan data baris excel
    public function map($proposal): array
    {
        return [
            $proposal->id,
            $proposal->title,
            $proposal->client_name,
            $proposal->division,
            $proposal->status,
            $proposal->user ? $proposal->user->name : 'N/A',
            $proposal->created_at->format('d/m/Y H:i'),
        ];
    }

    // Styling baris header (warna hijau & tebal)
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '047857']]],
        ];
    }
}
