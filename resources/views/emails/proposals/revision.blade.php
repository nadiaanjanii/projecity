<x-mail::message>
# Permintaan Revisi Proposal Proyek

Yth. **{{ $proposal->user->name ?? 'Staf Projecity' }}**,

Proposal proyek Anda yang berjudul **"{{ $proposal->title }}"** (Klien: {{ $proposal->client_name }}) telah ditinjau oleh Manajer dan memerlukan **REVISI** sebelum dapat diverifikasi lebih lanjut.

### 📝 Catatan Revisi dari Manajer:
> **"{{ $reason }}"**

Mohon untuk segera melakukan perbaikan dokumen proposal dan mengunggah berkas revisi terbaru melalui dashboard Projecity:

<x-mail::button :url="config('app.frontend_url', 'http://localhost:3000') . '/dashboard/proposals'">
Unggah Revisi Proposal Sekarang
</x-mail::button>

Email ini dikirim secara otomatis oleh Sistem Resmi Projecity.

Hormat kami,<br>
**Manajemen Projecity**
</x-mail::message>
