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
        Schema::table('case_comments', function (Blueprint $table) {
            $table->string('status_at_comment')->nullable();
            $table->integer('solve_time')->nullable(); // in seconds
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('case_comments', function (Blueprint $table) {
            $table->dropColumn(['status_at_comment', 'solve_time']);
        });
    }
};
