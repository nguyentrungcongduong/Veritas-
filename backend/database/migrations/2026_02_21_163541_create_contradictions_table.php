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
        Schema::create('contradictions', function (Blueprint $table) {
            $table->id();
            $table->uuid('case_id');
            $table->foreign('case_id')->references('id')->on('cases')->cascadeOnDelete();
            $table->foreignId('clue_id')->constrained('clues')->cascadeOnDelete();
            $table->foreignId('statement_id')->constrained('statements')->cascadeOnDelete();
            $table->text('explanation');
            $table->unique(['case_id', 'clue_id', 'statement_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contradictions');
    }
};
