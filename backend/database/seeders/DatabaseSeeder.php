<?php

namespace Database\Seeders;

use App\Models\Clue;
use App\Models\Contradiction;
use App\Models\DetectiveCase;
use App\Models\Statement;
use App\Models\Suspect;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('DELETE FROM contradictions');
        DB::statement('DELETE FROM statements');
        DB::statement('DELETE FROM clues');
        DB::statement('DELETE FROM suspects');
        DB::statement('DELETE FROM investigations');
        DB::statement('DELETE FROM cases');
        DB::table('users')->where('email', 'mastermind@veritas.test')->delete();

        // ── Author / Mastermind (Criminal who created the case) ───────
        $mastermind = User::create([
            'name'     => 'Mastermind_X',
            'email'    => 'mastermind@veritas.test',
            'password' => bcrypt('password'),
        ]);

        // ── Vụ án ────────────────────────────────────────────────
        $case = DetectiveCase::create([
            'title'       => 'Vụ Trộm Kho Tiền Công Ty Minh Thịnh',
            'description' => 'Tối ngày 15/02, két sắt tại kho tiền tầng hầm Công ty Minh Thịnh bị mở trái phép. 500 triệu đồng biến mất. Camera hành lang ghi nhận chuyển động bất thường lúc 20:07. Hệ thống điện tử ghi lại mã nhân viên truy cập két sắt lúc 20:15. Hiện có 3 nghi phạm cần thẩm vấn.',
            'status'      => 'published',
            'difficulty'  => 3,
            'reward_fame' => 300,
            'author_id'   => $mastermind->id,
        ]);

        // ── Nghi phạm ───────────────────────────────────────────
        $thuQuy = Suspect::create([
            'case_id'    => $case->id,
            'name'       => 'Nguyễn Văn An (Thủ quỹ)',
            'bio'        => 'Thủ quỹ công ty, 8 năm kinh nghiệm. Là người duy nhất được cấp mã truy cập két sắt. Gần đây có khoản nợ cá nhân lớn.',
            'is_culprit' => true,
        ]);

        $thuKy = Suspect::create([
            'case_id'    => $case->id,
            'name'       => 'Trần Thị Bích (Thư ký)',
            'bio'        => 'Thư ký giám đốc, nhân viên mới 3 tháng. Thường xuyên ra vào tầng hầm để lấy hồ sơ lưu trữ.',
            'is_culprit' => false,
        ]);

        $baoVe = Suspect::create([
            'case_id'    => $case->id,
            'name'       => 'Lê Hoàng Dũng (Bảo vệ ca đêm)',
            'bio'        => 'Bảo vệ trực ca từ 18:00 đến 06:00. Phụ trách giám sát camera và tuần tra. Có tiền sử bị kỷ luật vì ngủ gật trong ca.',
            'is_culprit' => false,
        ]);

        // ── Lời khai ────────────────────────────────────────────
        // --- Thủ quỹ (culprit) ---
        $st1 = Statement::create([
            'suspect_id'     => $thuQuy->id,
            'content'        => 'Tôi rời văn phòng lúc 18:30 và đi thẳng về nhà. Tôi không quay lại công ty tối hôm đó.',
            'type'           => 'lie',
            'discovery_tier' => 0,  // Thấy ngay
        ]);

        $st2 = Statement::create([
            'suspect_id'     => $thuQuy->id,
            'content'        => 'Mã truy cập két sắt của tôi đã bị thay đổi tuần trước. Tôi không biết mã mới.',
            'type'           => 'lie',
            'discovery_tier' => 1,  // Unlock sau khi xem clue két sắt
            'trigger_keyword' => 'mã truy cập',
        ]);

        $st3 = Statement::create([
            'suspect_id'     => $thuQuy->id,
            'content'        => 'Tôi có vay nợ nhưng đã trả hết tháng trước rồi.',
            'type'           => 'lie',
            'discovery_tier' => 2,  // Deep: unlock sau khi tìm thấy bank statement
            'trigger_keyword' => 'khoản nợ',
        ]);

        // --- Thư ký ---
        $st4 = Statement::create([
            'suspect_id'     => $thuKy->id,
            'content'        => 'Tối hôm đó tôi ở nhà xem phim. Bạn trai tôi có thể xác nhận.',
            'type'           => 'truth',
            'discovery_tier' => 0,
        ]);

        $st5 = Statement::create([
            'suspect_id'     => $thuKy->id,
            'content'        => 'Lần cuối tôi xuống tầng hầm là 16:00 chiều để lấy hồ sơ hợp đồng.',
            'type'           => 'truth',
            'discovery_tier' => 0,
        ]);

        // --- Bảo vệ ---
        $st6 = Statement::create([
            'suspect_id'     => $baoVe->id,
            'content'        => 'Tôi đã ngồi tại phòng bảo vệ cả tối và không thấy ai ra vào sau 19:00.',
            'type'           => 'lie',
            'discovery_tier' => 0,
        ]);

        $st7 = Statement::create([
            'suspect_id'     => $baoVe->id,
            'content'        => 'Camera hành lang B3 bị lỗi từ tuần trước, tôi đã báo kỹ thuật nhưng chưa được sửa.',
            'type'           => 'lie',
            'discovery_tier' => 1,
            'trigger_keyword' => 'camera',
        ]);

        // ── Manh mối ────────────────────────────────────────────
        $clue1 = Clue::create([
            'case_id'        => $case->id,
            'name'           => 'Camera Hành Lang B3',
            'description'    => 'Footage cho thấy một bóng người di chuyển về phía kho tiền lúc 20:07. Dáng người cao, mặc áo sơ mi trắng, đi dép lê. Camera hoạt động bình thường, không bị lỗi.',
            'type'           => 'physical',
            'discovery_tier' => 0,  // Free clue
        ]);

        $clue2 = Clue::create([
            'case_id'        => $case->id,
            'name'           => 'Log Hệ Thống Két Sắt',
            'description'    => 'Access log ghi nhận mã số nhân viên NAV-03 (mã cá nhân của Thủ quỹ Nguyễn Văn An) mở két sắt lúc 20:15. Mã này chưa được thay đổi từ khi cấp.',
            'type'           => 'digital',
            'discovery_tier' => 1,  // Unlock khi click "mã truy cập"
            'trigger_keyword' => 'mã truy cập',
        ]);

        $clue3 = Clue::create([
            'case_id'        => $case->id,
            'name'           => 'Sao Kê Ngân Hàng',
            'description'    => 'Sao kê tài khoản cá nhân của Nguyễn Văn An cho thấy khoản nợ 450 triệu chưa thanh toán, deadline ngày 20/02. Không có giao dịch trả nợ nào trong tháng 2.',
            'type'           => 'digital',
            'discovery_tier' => 2,  // Deep — unlock khi click "khoản nợ"
            'trigger_keyword' => 'khoản nợ',
        ]);

        $clue4 = Clue::create([
            'case_id'        => $case->id,
            'name'           => 'Nhật Ký Tuần Tra Bảo Vệ',
            'description'    => 'Sổ ghi chép tuần tra cho thấy Lê Hoàng Dũng chỉ ghi 2 lần tuần tra (19:00 và 22:00), thiếu lần tuần tra 20:00. Mục 20:00 để trống.',
            'type'           => 'physical',
            'discovery_tier' => 1,
            'trigger_keyword' => 'tuần tra',
        ]);

        // ── Mâu thuẫn ──────────────────────────────────────────
        // Camera hoạt động ↔ Bảo vệ nói camera bị lỗi
        Contradiction::create([
            'case_id'      => $case->id,
            'clue_id'      => $clue1->id,
            'statement_id' => $st7->id,
            'explanation'   => 'Camera hành lang B3 hoạt động bình thường và ghi lại hình ảnh rõ ràng. Lời khai bảo vệ nói camera bị lỗi là sai.',
        ]);

        // Camera ghi hình 20:07 ↔ Thủ quỹ nói đã về nhà lúc 18:30
        Contradiction::create([
            'case_id'      => $case->id,
            'clue_id'      => $clue1->id,
            'statement_id' => $st1->id,
            'explanation'   => 'Camera ghi lại bóng người lúc 20:07, mặc áo sơ mi trắng. Thủ quỹ khai rời lúc 18:30 và không quay lại, nhưng footage cho thấy điều ngược lại.',
        ]);

        // Log két sắt mã NAV-03 ↔ Thủ quỹ nói không biết mã mới
        Contradiction::create([
            'case_id'      => $case->id,
            'clue_id'      => $clue2->id,
            'statement_id' => $st2->id,
            'explanation'   => 'Log hệ thống xác nhận mã NAV-03 (của Thủ quỹ) đã mở két lúc 20:15. Mã này CHƯA TỪNG bị thay đổi — lời khai "không biết mã mới" là dối trá.',
        ]);

        // Sao kê nợ chưa trả ↔ Thủ quỹ nói đã trả hết
        Contradiction::create([
            'case_id'      => $case->id,
            'clue_id'      => $clue3->id,
            'statement_id' => $st3->id,
            'explanation'   => 'Sao kê ngân hàng cho thấy khoản nợ 450 triệu vẫn còn nguyên, deadline 20/02. Lời khai "đã trả hết tháng trước" hoàn toàn sai sự thật. Đây là động cơ phạm tội.',
        ]);

        // Nhật ký tuần tra trống 20:00 ↔ Bảo vệ nói ngồi phòng cả tối
        Contradiction::create([
            'case_id'      => $case->id,
            'clue_id'      => $clue4->id,
            'statement_id' => $st6->id,
            'explanation'   => 'Nhật ký tuần tra thiếu mục 20:00 — đúng thời điểm xảy ra trộm. Bảo vệ khai "ngồi cả tối" nhưng sổ ghi chứng minh anh ta không làm nhiệm vụ. Dù không phải hung thủ, bảo vệ đã che giấu sự tắc trách.',
        ]);

        // ── Output ──────────────────────────────────────────────
        $this->command->info("╔═══════════════════════════════════════════╗");
        $this->command->info("║  CASE SEEDED — DISCOVERY TIERS ENABLED   ║");
        $this->command->info("╠═══════════════════════════════════════════╣");
        $this->command->info("║ Case UUID : {$case->id}");
        $this->command->info("║ Suspects  : 3 (1 culprit + 2 innocent)");
        $this->command->info("║ Statements: 7 (3 lies + 4 truths)");
        $this->command->info("║ Clues     : 4 (Tier 0:1, Tier 1:2, Tier 2:1)");
        $this->command->info("║ Contradictions: 5 links");
        $this->command->info("╠═══════════════════════════════════════════╣");
        $this->command->info("║ Culprit   : {$thuQuy->id}");
        $this->command->info("╚═══════════════════════════════════════════╝");
    }
}
