<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investigations', function (Blueprint $table) {
            $table->id();
            // Nullable: Walking Skeleton không yêu cầu auth, nhưng để sẵn
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->uuid('case_id');
            $table->foreign('case_id')->references('id')->on('cases')->cascadeOnDelete();
            $table->enum('status', ['investigating', 'solved', 'failed'])->default('investigating');
            $table->unsignedTinyInteger('attempts_left')->default(3); // 3 lượt đoán
            $table->unsignedInteger('fame_earned')->default(0);
            // JSONB: lưu các clue đã thu thập + board state cho React Flow sau này
            $table->jsonb('discovered_clues')->default('[]');
            $table->jsonb('board_state')->default('{}');
            $table->timestamp('solved_at')->nullable();
            $table->timestamps();

            // Mỗi user chỉ có 1 investigation per case
            $table->unique(['user_id', 'case_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investigations');
    }
};
