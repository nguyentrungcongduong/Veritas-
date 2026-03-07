<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Discovery Tier System
 *
 * tier 0 = visible ngay từ đầu (free)
 * tier 1 = unlock sau hành động đầu tiên (xem suspect, click keyword)
 * tier 2 = unlock sau khi tìm được tier 1
 * tier 3 = hidden deep — chỉ unlock qua trigger đặc biệt
 *
 * trigger_keyword: từ khóa trong statement/clue khác mà khi click sẽ unlock item này
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clues', function (Blueprint $table) {
            $table->unsignedTinyInteger('discovery_tier')->default(0)->after('type');
            $table->string('trigger_keyword')->nullable()->after('discovery_tier');
        });

        Schema::table('statements', function (Blueprint $table) {
            $table->unsignedTinyInteger('discovery_tier')->default(0)->after('type');
            $table->string('trigger_keyword')->nullable()->after('discovery_tier');
        });
    }

    public function down(): void
    {
        Schema::table('clues', function (Blueprint $table) {
            $table->dropColumn(['discovery_tier', 'trigger_keyword']);
        });
        Schema::table('statements', function (Blueprint $table) {
            $table->dropColumn(['discovery_tier', 'trigger_keyword']);
        });
    }
};
