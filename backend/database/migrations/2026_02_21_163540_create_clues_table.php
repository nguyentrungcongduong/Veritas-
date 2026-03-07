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
        Schema::create('clues', function (Blueprint $table) {
            $table->id();
            $table->uuid('case_id');
            $table->foreign('case_id')->references('id')->on('cases')->cascadeOnDelete();
            $table->string('name');
            $table->text('description');
            $table->enum('type', ['physical', 'digital', 'testimony'])->default('physical');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clues');
    }
};
