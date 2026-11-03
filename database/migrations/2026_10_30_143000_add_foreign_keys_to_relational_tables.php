<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Daftar relasi foreign key yang akan dipastikan dan ditambahkan dengan onDelete('cascade').
     *
     * @var array<int, array{table: string, column: string, references: string, on: string, on_delete: string}>
     */
    protected array $foreignKeys = [
        [
            'table' => 'proposals',
            'column' => 'user_id',
            'references' => 'id',
            'on' => 'users',
            'on_delete' => 'cascade',
        ],
        [
            'table' => 'proposal_versions',
            'column' => 'proposal_id',
            'references' => 'id',
            'on' => 'proposals',
            'on_delete' => 'cascade',
        ],
        [
            'table' => 'proposal_versions',
            'column' => 'created_by',
            'references' => 'id',
            'on' => 'users',
            'on_delete' => 'cascade',
        ],
        [
            'table' => 'comments',
            'column' => 'proposal_id',
            'references' => 'id',
            'on' => 'proposals',
            'on_delete' => 'cascade',
        ],
        [
            'table' => 'comments',
            'column' => 'user_id',
            'references' => 'id',
            'on' => 'users',
            'on_delete' => 'cascade',
        ],
        [
            'table' => 'proposal_comments', // Kompatibilitas jika tabel bernama proposal_comments
            'column' => 'proposal_id',
            'references' => 'id',
            'on' => 'proposals',
            'on_delete' => 'cascade',
        ],
        [
            'table' => 'proposal_comments', // Kompatibilitas jika tabel bernama proposal_comments
            'column' => 'user_id',
            'references' => 'id',
            'on' => 'users',
            'on_delete' => 'cascade',
        ],
        [
            'table' => 'notifications',
            'column' => 'user_id',
            'references' => 'id',
            'on' => 'users',
            'on_delete' => 'cascade',
        ],
        [
            'table' => 'notifications',
            'column' => 'proposal_id',
            'references' => 'id',
            'on' => 'proposals',
            'on_delete' => 'cascade',
        ],
        [
            'table' => 'audit_logs',
            'column' => 'user_id',
            'references' => 'id',
            'on' => 'users',
            'on_delete' => 'cascade',
        ],
        [
            'table' => 'sessions',
            'column' => 'user_id',
            'references' => 'id',
            'on' => 'users',
            'on_delete' => 'cascade',
        ],
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach ($this->foreignKeys as $fk) {
            // Pastikan tabel anak dan tabel induk ada
            if (!Schema::hasTable($fk['table']) || !Schema::hasTable($fk['on'])) {
                continue;
            }

            // Pastikan kolom foreign key ada di tabel anak
            if (!Schema::hasColumn($fk['table'], $fk['column'])) {
                continue;
            }

            // Cek constraint foreign key yang sudah ada pada kolom ini
            $existingFks = Schema::getForeignKeys($fk['table']);
            $matchedFk = collect($existingFks)->first(function ($item) use ($fk) {
                return in_array($fk['column'], $item['columns'] ?? []);
            });

            // Jika foreign key sudah ada dengan konfigurasi target dan onDelete yang sama persis, lewati
            if ($matchedFk) {
                $sameTarget = ($matchedFk['foreign_table'] ?? '') === $fk['on'];
                $sameOnDelete = strtolower($matchedFk['on_delete'] ?? '') === strtolower($fk['on_delete']);

                if ($sameTarget && $sameOnDelete) {
                    continue;
                }

                // Jika sudah ada tapi berbeda action onDelete (misal 'set null'), lepaskan dulu constraint lama
                Schema::table($fk['table'], function (Blueprint $table) use ($matchedFk) {
                    $table->dropForeign($matchedFk['name']);
                });
            }

            // Bersihkan data yatim (orphan rows) jika ada sebelum membuat constraint baru
            // agar migration tidak gagal karena error integrity constraint (1452)
            DB::table($fk['table'])
                ->whereNotNull($fk['column'])
                ->whereNotIn($fk['column'], DB::table($fk['on'])->select($fk['references']))
                ->delete();

            // Tambahkan Foreign Key constraint dengan onDelete('cascade')
            Schema::table($fk['table'], function (Blueprint $table) use ($fk) {
                $table->foreign($fk['column'])
                    ->references($fk['references'])
                    ->on($fk['on'])
                    ->onDelete($fk['on_delete']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach ($this->foreignKeys as $fk) {
            if (!Schema::hasTable($fk['table']) || !Schema::hasColumn($fk['table'], $fk['column'])) {
                continue;
            }

            $existingFks = Schema::getForeignKeys($fk['table']);
            $matchedFk = collect($existingFks)->first(function ($item) use ($fk) {
                return in_array($fk['column'], $item['columns'] ?? []);
            });

            if ($matchedFk) {
                Schema::table($fk['table'], function (Blueprint $table) use ($matchedFk) {
                    $table->dropForeign($matchedFk['name']);
                });

                // Khusus audit_logs, kembalikan ke onDelete('set null') aslinya jika ada
                if ($fk['table'] === 'audit_logs' && $fk['column'] === 'user_id' && Schema::hasTable('users')) {
                    Schema::table('audit_logs', function (Blueprint $table) {
                        $table->foreign('user_id')
                            ->references('id')
                            ->on('users')
                            ->onDelete('set null');
                    });
                }
            }
        }
    }
};
