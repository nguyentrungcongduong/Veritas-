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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('fame')->default(0);
            $table->unsignedInteger('prestige')->default(0);
            $table->unsignedInteger('streak')->default(0);
            $table->unsignedInteger('cases_solved')->default(0);
            $table->unsignedInteger('cases_created')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['fame', 'prestige', 'streak', 'cases_solved', 'cases_created']);
        });
    }
};
