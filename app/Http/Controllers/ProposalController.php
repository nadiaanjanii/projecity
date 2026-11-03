<?php

namespace App\Http\Controllers;

use App\Models\Proposal;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProposalController extends Controller
{
    // FITUR: Tampilkan dashboard proposal
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Proposal::where('is_checked', 0);

        // Coding filter data divisi staf
        if ($user->role == 'staff') {
            $query->where('division', $user->position);
        }

        // Manager filter divisi dari sidebar
        $activeDivision = null;
        if ($user->role == 'manager' && $request->has('division')) {
            $activeDivision = $request->get('division');
            $query->where('division', $activeDivision);
        }

        // Filter proposal yang butuh revisi
        if ($request->get('filter') == 'revision') {
            $query->whereNotNull('notes');
        }

        // Coding urutan data proposal
        $proposals = $query->latest()->get();
        $groupedProposals = $proposals->groupBy('division');

        // Statistik sidebar untuk Manager dan Staff
        $divisions = collect();
        $divisionStats = collect();
        $staffStats = null;
        if ($user->role == 'manager') {
            $divisions = User::where('role', 'staff')
                ->whereNotNull('position')
                ->where('position', '!=', '')
                ->pluck('position')
                ->unique()
                ->sort()
                ->values();

            $divisionStats = $divisions->mapWithKeys(function ($div) {
                return [$div => [
                    'proposals' => Proposal::where('division', $div)->where('is_checked', 0)->count(),
                    'staff' => User::where('role', 'staff')->where('position', $div)->count(),
                    'archived' => Proposal::where('division', $div)->where('is_checked', 1)->count(),
                ]];
            });
        } elseif ($user->role == 'staff') {
            $staffStats = [
                'proposals' => Proposal::where('division', $user->position)->where('is_checked', 0)->count(),
                'archived' => Proposal::where('division', $user->position)->where('is_checked', 1)->count(),
                'total' => Proposal::where('division', $user->position)->count()
            ];
        }

        $users = ($user->role == 'manager') ? User::where('role', 'staff')->get() : collect();

        return view('index', compact('groupedProposals', 'users', 'divisions', 'divisionStats', 'activeDivision', 'staffStats'));
    }

    // FITUR: Upload proposal baru (Staff)
    public function store(Request $request)
    {
        if (Auth::user()->role !== 'staff') {
            return redirect()->back()->with('error', 'Hanya staff yang dapat menambah proposal.');
        }

        // Coding validasi input & file proposal
        $request->validate([
            'title' => 'required|string|max:255',
            'client_name' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png,webp|max:51200',
        ]);

        $path = $request->file('file')->store('proposals', 'public');

        // Coding simpan data proposal
        Proposal::create([
            'title' => $request->title,
            'client_name' => $request->client_name,
            'file_path' => $path,
            'user_id' => Auth::id(),
            'division' => Auth::user()->position,
        ]);

        return redirect()->route('dashboard')->with('success', 'Proposal berhasil diunggah ke Divisi ' . Auth::user()->position);
    }

    // FITUR: Ubah divisi / posisi staff (Manager)
    public function updatePosition(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update([
            'position' => $request->position
        ]);

        return redirect()->back()->with('success', 'Posisi ' . $user->name . ' berhasil diubah ke ' . $request->position);
    }

    // FITUR: Halaman form edit proposal
    public function edit($id)
    {
        $proposal = Proposal::findOrFail($id);
        return view('edit', compact('proposal'));
    }

    // FITUR: Simpan perubahan edit proposal
    public function update(Request $request, $id)
    {
        $proposal = Proposal::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'client_name' => 'required|string|max:255',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,webp|max:51200',
        ]);

        $proposal->title = $request->title;
        $proposal->client_name = $request->client_name;
        $proposal->notes = null;

        if ($request->hasFile('file')) {
            if (Storage::disk('public')->exists($proposal->file_path)) {
                Storage::disk('public')->delete($proposal->file_path);
            }
            $path = $request->file('file')->store('proposals', 'public');
            $proposal->file_path = $path;
        }

        $proposal->save();
        return redirect()->route('dashboard')->with('success', 'Proposal diperbarui!');
    }

    // FITUR: Download file proposal
    public function download($id)
    {
        $proposal = Proposal::findOrFail($id);
        $path = storage_path('app/public/' . $proposal->file_path);

        if (file_exists($path)) {
            return response()->download($path, Str::slug($proposal->title) . '.pdf');
        }
        return redirect()->back()->with('error', 'File tidak ditemukan.');
    }

    // FITUR: Verifikasi atau minta revisi proposal (Manager)
    public function toggleCheck(Request $request, $id)
    {
        $proposal = Proposal::findOrFail($id);

        if ($request->filled('notes')) {
            $proposal->notes = $request->notes;
        }

        if ($request->action == 'verify') {
            $proposal->is_checked = 1;
            $pesan = 'Proposal berhasil diverifikasi!';
        } else {
            $proposal->is_checked = 0;
            $pesan = 'Catatan revisi dikirim!';
        }

        $proposal->save();
        return redirect()->back()->with('success', $pesan);
    }

    // FITUR: Hapus proposal
    public function destroy($id)
    {
        $proposal = Proposal::findOrFail($id);
        $user = Auth::user();

        // Coding proteksi: staf dilarang hapus proposal verified
        if ($user->role == 'staff' && ($proposal->is_checked == 1 || $proposal->status == 'VERIFIED')) {
            return redirect()->back()->with('error', 'Staff tidak dapat menghapus proposal yang sudah Verified.');
        }

        if (Storage::disk('public')->exists($proposal->file_path)) {
            Storage::disk('public')->delete($proposal->file_path);
        }
        $proposal->delete();
        return redirect()->back()->with('success', 'Proposal dihapus.');
    }

    // FITUR: Arsip proposal (proposal yang sudah selesai diverifikasi)
    public function archive(Request $request)
    {
        $user = Auth::user();
        $query = Proposal::where('is_checked', 1);

        if ($user->role == 'staff') {
            $query->where('division', $user->position);
        }

        // Manager filter divisi dari sidebar
        $activeDivision = null;
        if ($user->role == 'manager' && $request->has('division')) {
            $activeDivision = $request->get('division');
            $query->where('division', $activeDivision);
        }

        $proposals = $query->latest()->get();
        $groupedProposals = $proposals->groupBy('division');

        $divisions = collect();
        $divisionStats = collect();
        $staffStats = null;
        if ($user->role == 'manager') {
            $divisions = User::where('role', 'staff')
                ->whereNotNull('position')
                ->where('position', '!=', '')
                ->pluck('position')
                ->unique()
                ->sort()
                ->values();

            $divisionStats = $divisions->mapWithKeys(function ($div) {
                return [$div => [
                    'proposals' => Proposal::where('division', $div)->where('is_checked', 0)->count(),
                    'staff' => User::where('role', 'staff')->where('position', $div)->count(),
                    'archived' => Proposal::where('division', $div)->where('is_checked', 1)->count(),
                ]];
            });
        } elseif ($user->role == 'staff') {
            $staffStats = [
                'proposals' => Proposal::where('division', $user->position)->where('is_checked', 0)->count(),
                'archived' => Proposal::where('division', $user->position)->where('is_checked', 1)->count(),
                'total' => Proposal::where('division', $user->position)->count()
            ];
        }

        return view('archive', compact('groupedProposals', 'divisions', 'divisionStats', 'activeDivision', 'staffStats'));
    }
}
