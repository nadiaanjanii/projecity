<x-mail::message>
# Pemberitahuan Verifikasi Proposal

Yth. {{ $proposal->user->name }},

Melalui email ini, kami menginformasikan bahwa proposal proyek Anda yang berjudul **"{{ $proposal->title }}"** telah melalui proses evaluasi dan secara resmi dinyatakan **TERVERIFIKASI**.

Dokumen tersebut saat ini telah tersimpan dalam sistem arsip Projecity sebagai aset digital perusahaan. Anda dapat meninjau kembali detail dokumen tersebut melalui tautan di bawah ini:

<x-mail::button :url="config('app.frontend_url', 'http://localhost:3000') . '/dashboard/proposals'">
Lihat Proposal Terverifikasi
</x-mail::button>

Demikian informasi ini kami sampaikan. Terima kasih atas kerja sama dan dedikasi yang Anda berikan terhadap kualitas dokumen perusahaan.

Hormat kami,<br>
**Manajemen Projecity**
</x-mail::message>
