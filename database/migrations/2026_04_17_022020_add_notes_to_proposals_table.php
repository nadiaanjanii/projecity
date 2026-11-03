<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            // Kita tambahkan kolom notes bertipe text (bisa nampung tulisan panjang)
            // nullable() artinya boleh kosong, after('is_checked') biar urutannya rapi di database
            $table->text('notes')->nullable()->after('is_checked');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            // Jika migrasi di-rollback, hapus kolom notes
            $table->dropColumn('notes');
        });
    }
};
