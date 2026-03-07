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
        Schema::create('suspects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('case_id');
            $table->foreign('case_id')->references('id')->on('cases')->cascadeOnDelete();
            $table->string('name');
            $table->text('bio')->nullable();
            $table->boolean('is_culprit')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suspects');
    }
};
