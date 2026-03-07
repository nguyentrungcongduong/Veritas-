<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cases', function (Blueprint $table) {
            // `difficulty` đã tồn tại trong DB từ migration trước (kiểu int4).
            // Chỉ cần thêm `reward_fame` — Fame thưởng khi phá án thành công.
            $table->integer('reward_fame')->default(100)->after('difficulty');
        });
    }

    public function down(): void
    {
        Schema::table('cases', function (Blueprint $table) {
            $table->dropColumn('reward_fame');
        });
    }
};
