<x-mail::message>
# Pemberitahuan Unggahan Revisi Proposal

Halo Tim Manajemen,

Staf **{{ $sender->name }}** (Divisi {{ $proposal->division }}) telah mengunggah berkas revisi terbaru untuk proposal proyek **"{{ $proposal->title }}"** (Klien: {{ $proposal->client_name }}).

@if($notes)
**Catatan Perbaikan dari Staf:**
> {{ $notes }}
@endif

Silakan lakukan peninjauan dan verifikasi berkas proposal terbaru melalui dashboard Projecity:

<x-mail::button :url="config('app.frontend_url', 'http://localhost:3000') . '/dashboard/proposals'">
Buka & Verifikasi Proposal
</x-mail::button>

Hormat kami,<br>
**Sistem Notifikasi Projecity**
</x-mail::message>
