<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\Proposal;
use App\Models\User;
use App\Traits\Auditable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DivisionController extends Controller
{
    use Auditable;

    // FITUR: Ambil daftar divisi (lengkap dengan jumlah staf dan proposal)
    public function index()
    {
        $divisions = Division::all()->map(function($div) {
            $div->staff_count = User::whereRaw('UPPER(position) = ?', [strtoupper($div->name)])
                ->orWhereRaw('UPPER(position) = ?', [strtoupper(str_replace('DESIGN', 'Desain', $div->name))])
                ->count();
                
            $div->proposals_count = Proposal::whereRaw('UPPER(division) = ?', [strtoupper($div->name)])
                ->orWhereRaw('UPPER(division) = ?', [strtoupper(str_replace('DESIGN', 'Desain', $div->name))])
                ->count();
                
            return $div;
        });

        return response()->json($divisions);
    }

    // FITUR: Tambah divisi baru
    public function store(Request $request)
    {
        if (!Auth::user()->hasPermissionTo('tambah divisi') && !Auth::user()->hasPermissionTo('kelola divisi')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menambah divisi'], 403);
        }

        $request->validate([
            'name' => 'required|string|unique:divisions,name|max:255',
        ]);

        $division = Division::create([
            'name' => strtoupper($request->name),
        ]);

        $this->logAction('CREATE', 'DIVISION', $division->id, ['name' => $division->name]);

        return response()->json($division, 201);
    }

    // FITUR: Hapus divisi
    public function destroy($id)
    {
        if (!Auth::user()->hasPermissionTo('hapus divisi') && !Auth::user()->hasPermissionTo('kelola divisi')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menghapus divisi'], 403);
        }

        $division = Division::findOrFail($id);
        
        $staffCount = User::whereRaw('UPPER(position) = ?', [strtoupper($division->name)])->count();
        $proposalCount = Proposal::whereRaw('UPPER(division) = ?', [strtoupper($division->name)])->count();

        // Cegah hapus jika divisi masih memiliki staf atau proposal
        if ($staffCount > 0 || $proposalCount > 0) {
            return response()->json([
                'message' => "Divisi '{$division->name}' tidak dapat dihapus karena masih memiliki {$staffCount} personel dan {$proposalCount} proposal terikat."
            ], 422);
        }

        $this->logAction('DELETE', 'DIVISION', $id, ['name' => $division->name]);

        $division->delete();

        return response()->json(['message' => 'Divisi berhasil dihapus']);
    }
}
