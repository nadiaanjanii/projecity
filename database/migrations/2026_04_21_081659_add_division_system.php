<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('users', function (Blueprint $table) {
        // Default 'General' agar tidak error saat daftar baru
        $table->string('position')->default('General')->after('role');
    });

    Schema::table('proposals', function (Blueprint $table) {
        $table->string('division')->nullable()->after('client_name');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
