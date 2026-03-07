<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cases', function (Blueprint $table) {
            // Lưu toàn bộ React Flow state (nodes + edges) của Criminal's Blueprint
            $table->jsonb('blueprint_data')->nullable()->after('react_flow_draft');
            // UUID của hung thủ — để Self-Solve validation
            $table->uuid('correct_suspect_id')->nullable()->after('blueprint_data');
        });
    }

    public function down(): void
    {
        Schema::table('cases', function (Blueprint $table) {
            $table->dropColumn(['blueprint_data', 'correct_suspect_id']);
        });
    }
};
