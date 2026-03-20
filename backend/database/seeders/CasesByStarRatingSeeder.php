<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CasesByStarRatingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seeds 15 cases - 3 cases per star rating (1-5 stars)
     */
    public function run(): void
    {
        // Clear existing data
        DB::statement('DELETE FROM contradictions');
        DB::statement('DELETE FROM statements');
        DB::statement('DELETE FROM clues');
        DB::statement('DELETE FROM suspects');
        DB::statement('DELETE FROM investigations');
        DB::statement('DELETE FROM cases');
        DB::table('users')->where('email', 'mastermind@veritas.test')->delete();

        // Create Mastermind user
        $mastermindId = (string) Str::uuid();
        DB::table('users')->insert([
            'id' => $mastermindId,
            'name' => 'Mastermind_X',
            'email' => 'mastermind@veritas.test',
            'password' => bcrypt('password'),
            'fame' => 10000,
            'prestige' => 100,
            'rank' => 'Grandmaster',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $allCases = [
            // === CẤP 1 SAO - Dễ (3 cases) ===
            $this->createCase1A(),
            $this->createCase1B(),
            $this->createCase1C(),
            
            // === CẤP 2 SAO - Trung bình (3 cases) ===
            $this->createCase2A(),
            $this->createCase2B(),
            $this->createCase2C(),
            
            // === CẤP 3 SAO - Khó (3 cases) ===
            $this->createCase3A(),
            $this->createCase3B(),
            $this->createCase3C(),
            
            // === CẤP 4 SAO - Rất khó (3 cases) ===
            $this->createCase4A(),
            $this->createCase4B(),
            $this->createCase4C(),
            
            // === CẤP 5 SAO - Cực khó (3 cases) ===
            $this->createCase5A(),
            $this->createCase5B(),
            $this->createCase5C(),
        ];

        $caseCount = 0;
        foreach ($allCases as $caseData) {
            $this->insertCase($caseData, $mastermindId);
            $caseCount++;
        }

        echo "✅ Đã seed thành công {$caseCount} vụ án (3 vụ án cho mỗi cấp sao 1-5)!\n";
        echo "📊 Phân bố: 1⭐×3 | 2⭐×3 | 3⭐×3 | 4⭐×3 | 5⭐×3\n";
    }

    private function insertCase(array $data, string $authorId)
    {
        $caseId = (string) Str::uuid();
        
        // 1. Insert Case
        DB::table('cases')->insert([
            'id' => $caseId,
            'title' => $data['title'],
            'description' => $data['description'],
            'difficulty' => $data['difficulty'],
            'reward_fame' => $data['difficulty'] * 100,
            'status' => 'published',
            'is_solved_by_creator' => true,
            'author_id' => $authorId,
            'blueprint_data' => json_encode($data['blueprint_data'] ?? ['nodes' => [], 'edges' => []]),
            'created_at' => Carbon::now()->subDays(rand(1, 60)),
            'updated_at' => Carbon::now(),
        ]);

        // Mappings
        $suspectMap = [];
        $statementMap = [];
        $clueMap = [];

        // 2. Insert Suspects
        foreach ($data['suspects'] as $s) {
            $sId = (string) Str::uuid();
            $suspectMap[$s['temp_id']] = $sId;
            
            DB::table('suspects')->insert([
                'id' => $sId,
                'case_id' => $caseId,
                'name' => $s['name'],
                'bio' => $s['bio'],
                'is_culprit' => $s['is_culprit'],
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }

        // 3. Insert Statements
        foreach ($data['statements'] as $st) {
            $stId = (string) Str::uuid();
            DB::table('statements')->insert([
                'id' => $stId,
                'suspect_id' => $suspectMap[$st['suspect_temp_id']],
                'content' => $st['content'],
                'type' => $st['type'],
                'discovery_tier' => $st['discovery_tier'] ?? 0,
                'trigger_keyword' => $st['trigger_keyword'] ?? null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            $statementMap[$st['temp_id']] = $stId;
        }

        // 4. Insert Clues
        foreach ($data['clues'] as $c) {
            $cId = (string) Str::uuid();
            DB::table('clues')->insert([
                'id' => $cId,
                'case_id' => $caseId,
                'name' => $c['name'],
                'description' => $c['description'],
                'type' => $c['type'],
                'discovery_tier' => $c['discovery_tier'] ?? 0,
                'trigger_keyword' => $c['trigger_keyword'] ?? null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            $clueMap[$c['temp_id']] = $cId;
        }

        // 5. Insert Contradictions
        foreach ($data['contradictions'] as $con) {
            DB::table('contradictions')->insert([
                'id' => (string) Str::uuid(),
                'case_id' => $caseId,
                'statement_id' => $statementMap[$con['statement_temp_id']],
                'clue_id' => isset($con['clue_temp_id']) ? $clueMap[$con['clue_temp_id']] : null,
                'explanation' => $con['explanation'],
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }

    // ==================== CẤP 1 SAO - DỄ ====================
    
    private function createCase1A()
    {
        return [
            'title' => 'Món Quà Biến Mất (1⭐)',
            'description' => 'Chiếc đồng hồ Rolex quý hiếm biến mất khỏi phòng khách trong bữa tiệc sinh nhật. Chỉ có 3 ngườitrong phòng tại thờ điểm đó.',
            'difficulty' => 1,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Minh (Con chủ nhà)', 'bio' => 'Con trai 15 tuổi, thích đồng hồ cao cấp nhưng bị cấm đùa vào.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Cô Lan (Giúp việc)', 'bio' => 'Làm việc 5 năm, được tin tưởng.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Anh Tuấn (Bạn bố)', 'bio' => 'Khách mờ, ngồi gần kệ đồng hồ.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Con đang chơi game trong phòng ngủ suốt tối, không ra ngoài.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's1', 'content' => 'Con chả biết đồng hồ để ở đâu.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'game'],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's2', 'content' => 'Tôi đang dọn dẹp ở bếp, không vào phòng khách.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's3', 'content' => 'Tôi ngồi trò chuyện với chủ nhà, có camera ghi lại.', 'type' => 'truth', 'discovery_tier' => 0],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Camera an ninh', 'description' => 'Ghi lại Minh ra khỏi phòng ngủ lúc 20:15, vào phòng khách 5 phút rồi quay lại.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Lịch sử game', 'description' => 'Máy tính của Minh không có hoạt động từ 20:10 đến 20:25.', 'type' => 'digital', 'discovery_tier' => 1, 'trigger_keyword' => 'game'],
                ['temp_id' => 'c3', 'name' => 'Dấu tay', 'description' => 'Dấu vân tay của Minh trên kệ kính trưng bày.', 'type' => 'physical', 'discovery_tier' => 0],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Minh nói ở phòng ngủ suốt tối nhưng camera thấy Minh vào phòng khách lúc 20:15.'],
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c3', 'explanation' => 'Dấu tay Minh trên kệ đồng hồ, chứng minh Minh đã chạm vào.'],
                ['statement_temp_id' => 'st2', 'clue_temp_id' => 'c2', 'explanation' => 'Lịch sử game cho thấy máy tính không hoạt động đúng thờ điểm đồng hồ mất. Minh đã nói dối về việc chơi game.'],
            ]
        ];
    }

    private function createCase1B()
    {
        return [
            'title' => 'Trộm Xe Đạp Trường Học (1⭐)',
            'description' => 'Chiếc xe đạp điện mới tinh bị trộm ngay trong khuôn viên trường. Chỉ có 3 học sinh còn lại sau giờ học.',
            'difficulty' => 1,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Hùng (Lớp trưởng)', 'bio' => 'Học sinh gương mẫu nhưng gia đình khó khăn.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Lan (Bạn nạn nhân)', 'bio' => 'Thân thiết với chủ xe, ở lại làm báo tường.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Nam (Thủ quỹ CLB)', 'bio' => 'Ở lại đếm quỹ, có chìa khóa cổng sau.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tớ về ngay sau tiếng trống, không ở lại.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tớ và Nam ở phòng học báo tường đến 18h.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tớ khóa cổng sau lúc 17:30, không ai ra vào.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's1', 'content' => 'Tớ không biết xe bị khóa hay không.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'khóa'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Camera cổng trước', 'description' => 'Ghi lại Hùng đi bộ ra lúc 17:45, không đi xe.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Camera bãi xe', 'description' => 'Hùng xuất hiện ở bãi xe lúc 17:20, dắt xe điện ra.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c3', 'name' => 'Vết xước ổ khóa', 'description' => 'Ổ khóa bị cạy bằng vật sắc, dấu vết mới.', 'type' => 'physical', 'discovery_tier' => 1, 'trigger_keyword' => 'khóa'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Hùng nói về ngay sau tiếng trống nhưng camera thấy Hùng ra lúc 17:45.'],
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c2', 'explanation' => 'Camera bãi xe cho thấy Hùng dắt xe điện ra, chứng minh Hùng đã lấy trộm.'],
            ]
        ];
    }

    private function createCase1C()
    {
        return [
            'title' => 'Bánh Ngọt Bị Đầu Độc (1⭐)',
            'description' => 'Chiếc bánh sinh nhật bị bỏ đường cay vào, làm 2 ngườ bỏng miệng. Chỉ có 3 ngườ chạm vào bánh.',
            'difficulty' => 1,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Hoa (Chị dâu)', 'bio' => 'Vừa cãi nhau với chủ tiệc về chuyện thừa kế.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Bếp trưởng', 'bio' => 'Làm bánh 10 năm, uy tín cao.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Phục vụ bàn', 'bio' => 'Nhân viên mới, phụ trách mang bánh ra.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi chỉ đứng nhìn, không đụng vào bánh.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi làm bánh theo công thức chuẩn, không có ớt.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tôi chỉ mang bánh từ bếp ra, không mở hộp.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's1', 'content' => 'Tôi không mang theo gì khi đến dự tiệc.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'túi'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Camera bếp', 'description' => 'Hoa vào bếp lúc 14:30, ở một mình 10 phút.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Camera sảnh', 'description' => 'Hoa mang túi nhỏ màu đỏ khi đến, nhưng rỗng khi về.', 'type' => 'digital', 'discovery_tier' => 1, 'trigger_keyword' => 'túi'],
                ['temp_id' => 'c3', 'name' => 'Gói bột ớt', 'description' => 'Tìm thấy gói bột ớt trống trong thùng rác bếp.', 'type' => 'physical', 'discovery_tier' => 0],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Hoa nói không đụng vào bánh nhưng camera thấy Hoa vào bếp 10 phút một mình.'],
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c3', 'explanation' => 'Gói bột ớt trong thùng rác chứng minh ai đó đã dùng nó đầu độc bánh.'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c2', 'explanation' => 'Hoa nói không mang gì nhưng camera thấy Hoa mang túi đến. Túi đựng bột ớt đã bị vứt.'],
            ]
        ];
    }

    // ==================== CẤP 2 SAO - TRUNG BÌNH ====================
    
    private function createCase2A()
    {
        return [
            'title' => 'Vụ Trộm Tranh Quý (2⭐)',
            'description' => 'Bức tranh sơn dầu trị giá 2 tỷ biến mất từ phòng triển lãm riêng trong đêm khai mạc. Hệ thống báo động không kêu.',
            'difficulty' => 2,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Nghệ sĩ Phong', 'bio' => 'Họa sĩ gốc, cho rằng tranh bị định giá quá thấp.', 'is_culprit' => false],
                ['temp_id' => 's2', 'name' => 'Quản lý Thảo', 'bio' => 'Ngườ có chìa khóa và mã báo động, vừa bị đe dọa sa thải.', 'is_culprit' => true],
                ['temp_id' => 's3', 'name' => 'Bảo vệ Cường', 'bio' => 'Trực đêm, có tiền sử ngủ gật.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi ở quán bar với bạn bè suốt đêm, có hóa đơn chứng minh.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi rở phòng triển lãm lúc 22h, bật báo động đầy đủ.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tôi tuần tra mỗi 30 phút, không thấy gì bất thường.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'ngủ'],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's2', 'content' => 'Tôi không biết ai có thể tắt báo động.', 'type' => 'lie', 'discovery_tier' => 2, 'trigger_keyword' => 'mã'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Log báo động', 'description' => 'Báo động bị tắt lúc 23:15 bằng mã quản lý, bật lại lúc 00:30.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Camera hành lang', 'description' => 'Thảo quay lại phòng triển lãm lúc 23:10, ra lúc 00:25.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c3', 'name' => 'Camera phòng bảo vệ', 'description' => 'Cường ngủ gật từ 23:00 đến 00:45.', 'type' => 'digital', 'discovery_tier' => 1, 'trigger_keyword' => 'ngủ'],
                ['temp_id' => 'c4', 'name' => 'Email đe dọa', 'description' => 'Thảo nhận email sa thải từ chủ triển lãm, gửi lúc 20:00.', 'type' => 'digital', 'discovery_tier' => 2, 'trigger_keyword' => 'mã'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st2', 'clue_temp_id' => 'c1', 'explanation' => 'Thảo nói bật báo động nhưng log cho thấy báo động bị tắt bằng mã quản lý.'],
                ['statement_temp_id' => 'st2', 'clue_temp_id' => 'c2', 'explanation' => 'Thảo nói rở lúc 22h nhưng camera thấy Thảo quay lại lúc 23:10.'],
                ['statement_temp_id' => 'st3', 'clue_temp_id' => 'c3', 'explanation' => 'Cường nói tuần tra đều đặn nhưng camera cho thấy Cường ngủ gật suốt.'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c4', 'explanation' => 'Thảo có động cơ rõ ràng - bị sa thải nên trộm tranh trả thù.'],
            ]
        ];
    }

    private function createCase2B()
    {
        return [
            'title' => 'Vụ Án Ở Quán Cafe (2⭐)',
            'description' => 'Chủ quán cafe bị ngất trong phòng làm việc, két sắt bị mở. Tiền thu trong ngày biến mất. Chỉ có 3 nhân viên có chìa khóa.',
            'difficulty' => 2,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Pha chế Tùng', 'bio' => 'Làm 2 năm, đang cần tiền chữa bệnh cho mẹ.', 'is_culprit' => false],
                ['temp_id' => 's2', 'name' => 'Thu ngân Hà', 'bio' => 'Nhân viên mới 1 tháng, hay lui tới phòng làm việc.', 'is_culprit' => true],
                ['temp_id' => 's3', 'name' => 'Phục vụ Đức', 'bio' => 'Làm 3 năm, được chủ quán tin tưởng như.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi chỉ ra vào phòng để lấy nguyên liệu, không đụng đến két.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi không có chìa khóa phòng làm việc, chỉ có chìa két.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tôi thấy chủ ngất lúc 21h, két đã mở sẵn.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's2', 'content' => 'Tôi không biết mật mã két sắt.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'mật mã'],
                ['temp_id' => 'st5', 'suspect_temp_id' => 's2', 'content' => 'Tôi không đụng vào ly cà phê của chủ.', 'type' => 'lie', 'discovery_tier' => 2, 'trigger_keyword' => 'cà phê'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Dấu vân tay', 'description' => 'Chỉ có vân tay Hà và chủ quán trên két sắt.', 'type' => 'physical', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Camera quầy', 'description' => 'Hà nhìn chủ quán nhập mật mã két lúc 19:30.', 'type' => 'digital', 'discovery_tier' => 1, 'trigger_keyword' => 'mật mã'],
                ['temp_id' => 'c3', 'name' => 'Ly cà phê', 'description' => 'Còn dư 1/3, test cho thấy có thuốc ngủ.', 'type' => 'physical', 'discovery_tier' => 2, 'trigger_keyword' => 'cà phê'],
                ['temp_id' => 'c4', 'name' => 'Lịch sử mở két', 'description' => 'Két mở lúc 20:45, lúc chủ đang ngủ gật.', 'type' => 'digital', 'discovery_tier' => 0],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st2', 'clue_temp_id' => 'c1', 'explanation' => 'Hà nói không có chìa khóa nhưng vân tay Hà có trên két.'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c2', 'explanation' => 'Hà nói không biết mật mã nhưng camera thấy Hà nhìn chủ nhập mã.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c3', 'explanation' => 'Hà nói không đụng vào cà phê nhưng chính ly cà phê của chủ có thuốc ngủ.'],
            ]
        ];
    }

    private function createCase2C()
    {
        return [
            'title' => 'Vụ Phá Hoại Vườn Hoa (2⭐)',
            'description' => 'Vườn hoa hồng quý hiếm bị xịt thuốc diệt cỏ, thiệt hại hàng trăm triệu. Xảy ra vào đêm khuyết trăng, chỉ 3 ngườ biết vị trí vườn.',
            'difficulty' => 2,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Ngườ hàng xóm Tú', 'bio' => 'Từng kiện chủ vườn về tranh chấp ranh giới.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Ngườ làm vườn Sáu', 'bio' => 'Chăm sóc vườn 10 năm, vừa bị cắt lương.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Con gái chủ vườn Mai', 'bio' => 'Không đồng ý bán đất, muốn giữ vườn.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi ngủ sớm tối đó, không ra ngoài sau 21h.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi rở vườn lúc 18h như mọi ngày.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tôi ở thành phố cả tuần nay, vừa về sáng nay.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's1', 'content' => 'Tôi không có chìa khóa cổng vườn.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'chìa khóa'],
                ['temp_id' => 'st5', 'suspect_temp_id' => 's1', 'content' => 'Tôi không biết loại thuốc nào dùng để phá hoại.', 'type' => 'lie', 'discovery_tier' => 2, 'trigger_keyword' => 'thuốc'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Camera an ninh', 'description' => 'Tú vào vườn lúc 23:30, ra lúc 00:15, mang bình xịt.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Dấu chân', 'description' => 'Dấu giày size 42 ở góc vườn, trùng size giày Tú.', 'type' => 'physical', 'discovery_tier' => 0],
                ['temp_id' => 'c3', 'name' => 'Hóa đơn thuốc', 'description' => 'Tú mua thuốc diệt cỏ online 3 ngày trước.', 'type' => 'digital', 'discovery_tier' => 2, 'trigger_keyword' => 'thuốc'],
                ['temp_id' => 'c4', 'name' => 'Chìa khóa dự phòng', 'description' => 'Chủ vườn từng cho Tú mượn chìa khóa năm ngoái.', 'type' => 'physical', 'discovery_tier' => 1, 'trigger_keyword' => 'chìa khóa'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Tú nói ngủ sớm nhưng camera thấy Tú vào vườn lúc 23:30.'],
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c2', 'explanation' => 'Dấu chân size 42 trùng với giày của Tú.'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c4', 'explanation' => 'Tú nói không có chìa khóa nhưng từng mượn chìa khóa dự phòng.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c3', 'explanation' => 'Tú nói không biết thuốc gì nhưng lại mua thuốc diệt cỏ 3 ngày trước.'],
            ]
        ];
    }

    // ==================== CẤP 3 SAO - KHÓ ====================
    
    private function createCase3A()
    {
        return [
            'title' => 'Vụ Án Ở Nhà Hát (3⭐)',
            'description' => 'Nghệ sĩ opera chính bị ngất xỉu ngay trước giờ diễn. Nguyên nhân: thuốc an thần quá liều trong chai nước. Vở diễn bị hủy, thiệt hại tỷ đồng.',
            'difficulty' => 3,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Ca sĩ đối thủ Linh', 'bio' => 'Diễn viên phụ được lên thay vai chính sau vụ việc.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Quản lý sân khấu An', 'bio' => 'Ngườ phụ trách đạo cụ và nước uống cho nghệ sĩ.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Nhạc trưởng Phúc', 'bio' => 'Từng cãi nhau với nạn nhân về cách diễn.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi đang tập thanh nhạc ở phòng riêng, không ra hậu trường.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi để chai nước trên bàn hậu trường lúc 19h, không ai đụng vào.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'chai'],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tôi ở dàn nhạc từ 18h đến 20h, có ngườ chứng kiến.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's1', 'content' => 'Tôi không biết nạn nhân uống loại nước gì.', 'type' => 'lie', 'discovery_tier' => 2, 'trigger_keyword' => 'nước'],
                ['temp_id' => 'st5', 'suspect_temp_id' => 's2', 'content' => 'Chai nước vẫn còn niêm phong khi tôi để vào.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'niêm phong'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Camera hậu trường', 'description' => 'Linh vào phòng hậu trường lúc 19:15, ở 5 phút.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Vân tay trên chai', 'description' => 'Vân tay Linh trên nắp chai, không có vân tay nạn nhân.', 'type' => 'physical', 'discovery_tier' => 1, 'trigger_keyword' => 'chai'],
                ['temp_id' => 'c3', 'name' => 'Niêm phong giả', 'description' => 'Nắp chai có dấu hiệu mở ra và đóng lại bằng keo.', 'type' => 'physical', 'discovery_tier' => 1, 'trigger_keyword' => 'niêm phong'],
                ['temp_id' => 'c4', 'name' => 'Danh sách dị ứng', 'description' => 'Linh biết nạn nhân chỉ uống nước suối brand X.', 'type' => 'document', 'discovery_tier' => 2, 'trigger_keyword' => 'nước'],
                ['temp_id' => 'c5', 'name' => 'Email công ty', 'description' => 'Linh nhận email sẽ bị thay thế nếu vở diễn thành công.', 'type' => 'digital', 'discovery_tier' => 2, 'trigger_keyword' => 'email'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Linh nói ở phòng riêng nhưng camera thấy Linh vào hậu trường.'],
                ['statement_temp_id' => 'st2', 'clue_temp_id' => 'c2', 'explanation' => 'Vân tay Linh trên chai nước, chứng minh Linh đã chạm vào.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c3', 'explanation' => 'Niêm phong bị mở và dán lại bằng keo, không phải niêm phong gốc.'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c4', 'explanation' => 'Linh biết nạn nhân chỉ uống loại nước cụ thể, đã lên kế hoạch từ trước.'],
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c5', 'explanation' => 'Linh có động cơ rõ ràng - sợ bị thay thế nếu vở diễn thành công.'],
            ]
        ];
    }

    private function createCase3B()
    {
        return [
            'title' => 'Vụ Trộm Ở Ngân Hàng (3⭐)',
            'description' => 'Két sắt cá nhân của 3 khách hàng bị mở trộm trong đêm. Kẻ gian biết mã số và có chìa khóa. Không có dấu hiệu đột nhập.',
            'difficulty' => 3,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Nhân viên kho quỹ Hùng', 'bio' => 'Có quyền truy cập mọi két, vừa nợ nần cờ bạc.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Bảo vệ ca đêm Thành', 'bio' => 'Trực đêm, có camera giám sát khu vực két.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Quản lý chi nhánh Loan', 'bio' => 'Ngườ duy nhất có master key, đang bị kiểm tra nội bộ.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi rở ngân hàng lúc 17h như mọi ngày, không quay lại.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi tuần tra khu vực két mỗi giờ, không thấy gì lạ.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'camera'],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Master key vẫn trong két sắt cá nhân của tôi suốt đêm.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's1', 'content' => 'Tôi không biết mã số của các két bị trộm.', 'type' => 'lie', 'discovery_tier' => 2, 'trigger_keyword' => 'mã'],
                ['temp_id' => 'st5', 'suspect_temp_id' => 's1', 'content' => 'Tôi không có nợ nần gì.', 'type' => 'lie', 'discovery_tier' => 2, 'trigger_keyword' => 'nợ'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Thẻ ra vào', 'description' => 'Hùng quét thẻ vào ngân hàng lúc 20:30, ra lúc 22:00.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Camera khu vực két', 'description' => 'Camera bị tắt từ 20:00 đến 22:30 do "bảo trì".', 'type' => 'digital', 'discovery_tier' => 1, 'trigger_keyword' => 'camera'],
                ['temp_id' => 'c3', 'name' => 'Log hệ thống két', 'description' => '3 két mở lúc 21:15, 21:30, 21:45 bằng mã đúng.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c4', 'name' => 'Email nội bộ', 'description' => 'Hùng có danh sách mã số tất cả két trong email công ty.', 'type' => 'digital', 'discovery_tier' => 2, 'trigger_keyword' => 'mã'],
                ['temp_id' => 'c5', 'name' => 'Tin nhắn đòi nợ', 'description' => 'Hùng nhận 15 tin nhắn đòi nợ trong tuần qua.', 'type' => 'digital', 'discovery_tier' => 2, 'trigger_keyword' => 'nợ'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Hùng nói rở lúc 17h nhưng thẻ ra vào cho thấy Hùng vào lúc 20:30.'],
                ['statement_temp_id' => 'st2', 'clue_temp_id' => 'c2', 'explanation' => 'Camera bị tắt trong suốt thờ gian Hùng ở trong ngân hàng.'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c4', 'explanation' => 'Hùng nói không biết mã nhưng email nội bộ chứa tất cả mã số.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c5', 'explanation' => 'Hùng nói không nợ nần nhưng có 15 tin nhắn đòi nợ.'],
            ]
        ];
    }

    private function createCase3C()
    {
        return [
            'title' => 'Vụ Án Ở Khách Sạn (3⭐)',
            'description' => 'Khách VIP tầng penthouse báo mất đồng hồ Rolex trị giá 5 tỷ. Phòng không có dấu hiệu đột nhập, chỉ có ngườ dọn phòng và quản lý có chìa khóa.',
            'difficulty' => 3,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Nhân viên dọn phòng Hoa', 'bio' => 'Làm 3 năm, được khách khen thưởng nhiều lần.', 'is_culprit' => false],
                ['temp_id' => 's2', 'name' => 'Quản lý tầng Minh', 'bio' => 'Có master key, đang gặp khó khăn tài chính.', 'is_culprit' => true],
                ['temp_id' => 's3', 'name' => 'Bảo vệ thang máy Cường', 'bio' => 'Phụ trách kiểm soát thang máy tầng penthouse.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi dọn phòng lúc 10h sáng, đồng hồ vẫn trên bàn.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi chỉ vào phòng để kiểm tra kỹ thuật lúc 14h, không thấy đồng hồ.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tôi thấy ông Minh vào phòng lúc 15h, ra lúc 15:15.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's2', 'content' => 'Tôi không biết khách để đồng hồ ở đâu.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'vị trí'],
                ['temp_id' => 'st5', 'suspect_temp_id' => 's2', 'content' => 'Tôi không có nhu cầu tiền bạc gấp.', 'type' => 'lie', 'discovery_tier' => 2, 'trigger_keyword' => 'tài chính'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Camera hành lang', 'description' => 'Minh vào phòng lúc 14:00 và 15:00, mỗi lần 15 phút.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Biên bản kiểm tra', 'description' => 'Minh không đăng ký kiểm tra kỹ thuật hôm đó.', 'type' => 'document', 'discovery_tier' => 1, 'trigger_keyword' => 'kiểm tra'],
                ['temp_id' => 'c3', 'name' => 'Camera thang máy', 'description' => 'Minh mang túi to hơn khi ra khỏi phòng lúc 15:15.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c4', 'name' => 'Email ngân hàng', 'description' => 'Minh nhận thông báo nợ thẻ tín dụng quá hạn 200 triệu.', 'type' => 'digital', 'discovery_tier' => 2, 'trigger_keyword' => 'tài chính'],
                ['temp_id' => 'c5', 'name' => 'Lịch sử master key', 'description' => 'Master key của Minh mở phòng penthouse lúc 14:05.', 'type' => 'digital', 'discovery_tier' => 1, 'trigger_keyword' => 'vị trí'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st2', 'clue_temp_id' => 'c1', 'explanation' => 'Minh nói vào lúc 14h nhưng camera thấy vào cả 14:00 và 15:00.'],
                ['statement_temp_id' => 'st2', 'clue_temp_id' => 'c2', 'explanation' => 'Minh không có biên bản kiểm tra kỹ thuật, vào phòng không có lý do chính đáng.'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c5', 'explanation' => 'Minh nói không biết đồng hồ ở đâu nhưng master key mở phòng đúng lúc đồng hồ biến mất.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c4', 'explanation' => 'Minh nói không cần tiền nhưng nợ thẻ tín dụng 200 triệu quá hạn.'],
            ]
        ];
    }

    // ==================== CẤP 4 SAO - RẤT KHÓ ====================
    
    private function createCase4A()
    {
        return [
            'title' => 'Vụ Án Kỳ Ảo Ở Biệt Thự (4⭐)',
            'description' => 'Triệu phú bị tìm thấy chết trong phòng khóa kín từ bên trong. Cửa sổ đóng chặt, chìa khóa trong túi nạn nhân. Một vụ án phòng kín hoàn hảo.',
            'difficulty' => 4,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Ngườ vợ kế Hương', 'bio' => 'Kết hôn 1 năm, được hưởng toàn bộ tài sản nếu chồng chết.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Con trai cả Minh', 'bio' => 'Từng tranh chấp tài sản, bị đuổi khỏi công ty.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Luật sư riêng Tuấn', 'bio' => 'Ngườ biết chi tiết di chúc, có chìa khóa dự phòng biệt thự.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi ngủ riêng phòng từ 22h, không ra ngoài đến sáng.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi rở biệt thự lúc 21h sau cãi nhau với bố, có camera chứng minh.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tôi đến lúc 8h sáng để bàn di chúc, thấy cửa phòng khóa.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's1', 'content' => 'Tôi không biết chồng có thói quen khóa cửa khi ngủ.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'thói quen'],
                ['temp_id' => 'st5', 'suspect_temp_id' => 's1', 'content' => 'Tôi không biết gì về chất độc.', 'type' => 'lie', 'discovery_tier' => 2, 'trigger_keyword' => 'độc'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Camera phòng ngủ Hương', 'description' => 'Hương ra khỏi phòng lúc 23:30, vào phòng chồng 30 phút.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Dấu chân', 'description' => 'Dấu chân ướt từ phòng tắm đến phòng chồng, trùng size chân Hương.', 'type' => 'physical', 'discovery_tier' => 0],
                ['temp_id' => 'c3', 'name' => 'Hệ thống thông gió', 'description' => 'Ống thông gió phòng có dấu hiệu bị tháo rồi lắp lại.', 'type' => 'physical', 'discovery_tier' => 1, 'trigger_keyword' => 'thói quen'],
                ['temp_id' => 'c4', 'name' => 'Chất độc', 'description' => 'Nạn nhân chết do cyanide, chất chỉ có ở phòng thí nghiệm công ty.', 'type' => 'physical', 'discovery_tier' => 2, 'trigger_keyword' => 'độc'],
                ['temp_id' => 'c5', 'name' => 'Email công ty', 'description' => 'Hương có quyền truy cập phòng thí nghiệm, lấy hóa chất 2 ngày trước.', 'type' => 'digital', 'discovery_tier' => 2, 'trigger_keyword' => 'độc'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Hương nói ngủ suốt đêm nhưng camera thấy Hương vào phòng chồng lúc 23:30.'],
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c2', 'explanation' => 'Dấu chân ướt từ phòng tắm Hương đến phòng chồng.'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c3', 'explanation' => 'Ống thông gió bị tháo - Hương vào qua đây rồi khóa cửa từ trong bằng chìa phụ.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c4', 'explanation' => 'Hương nói không biết chất độc nhưng nạn nhân chết do cyanide từ phòng thí nghiệm công ty.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c5', 'explanation' => 'Hương có quyền truy cập và lấy cyanide 2 ngày trước vụ án.'],
            ]
        ];
    }

    private function createCase4B()
    {
        return [
            'title' => 'Vụ Cướp Máy Bay (4⭐)',
            'description' => 'Kim cương quốc gia bị đánh cắp trên chuyến bay quốc tế. Kẻ cướp phải ở trên máy bay nhưng tất cả hành khách đều được kiểm tra, không ai mang theo.',
            'difficulty' => 4,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Tiếp viên trưởng Linh', 'bio' => 'Phục vụ khoang VIP, biết vị trí hòm kim cương.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Cơ trưởng Hoàng', 'bio' => 'Ngườ duy nhất ra vào buồng lái, không kiểm tra hành lý.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Vệ sĩ cảnh vụ Thắng', 'bio' => 'Phụ trách bảo vệ hòm kim cương, bị thuốc mê.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi phục vụ khoang thường, không vào VIP sau khi cất cánh.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi ở buồng lái suốt chuyến bay, có phi công phụ chứng kiến.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tôi bị thuốc mê ngay sau khi cất cánh, không biết gì.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's1', 'content' => 'Tôi không có chìa khóa khoang chứa hành lý.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'chìa khóa'],
                ['temp_id' => 'st5', 'suspect_temp_id' => 's1', 'content' => 'Tôi không biết kim cương để trong hòm nào.', 'type' => 'lie', 'discovery_tier' => 2, 'trigger_keyword' => 'hòm'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Camera khoang VIP', 'description' => 'Linh vào khoang VIP 3 lần, lần cuối ở 20 phút.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Máy quét hành lý', 'description' => 'Phát hiện vật kim loại lớn trong túi Linh khi rở máy bay.', 'type' => 'physical', 'discovery_tier' => 1, 'trigger_keyword' => 'hòm'],
                ['temp_id' => 'c3', 'name' => 'Hòm hành lý', 'description' => 'Tìm thấy hòm kim cương rỗng trong tủ đồ tiếp viên.', 'type' => 'physical', 'discovery_tier' => 1, 'trigger_keyword' => 'hòm'],
                ['temp_id' => 'c4', 'name' => 'Danh sách truy cập', 'description' => 'Linh có mã truy cập khoang hành lý do nhiệm vụ đặc biệt.', 'type' => 'document', 'discovery_tier' => 1, 'trigger_keyword' => 'chìa khóa'],
                ['temp_id' => 'c5', 'name' => 'Thùng rác tiếp viên', 'description' => 'Tìm thấy túi ni lông và dây cột trong thùng rác khu vực Linh.', 'type' => 'physical', 'discovery_tier' => 2, 'trigger_keyword' => 'giấu'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Linh nói không vào VIP nhưng camera thấy vào 3 lần.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c2', 'explanation' => 'Linh mang vật kim loại lớn ra khỏi máy bay, chính là hòm kim cương.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c3', 'explanation' => 'Hòm kim cương tìm thấy trong tủ đồ tiếp viên - Linh biết chính xác vị trí.'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c4', 'explanation' => 'Linh có mã truy cập khoang hành lý, không cần chìa khóa vật lý.'],
            ]
        ];
    }

    private function createCase4C()
    {
        return [
            'title' => 'Vụ Trộm Ở Thư Viện Cổ (4⭐)',
            'description' => 'Bản thảo quý hiếm thế kỷ 15 bị đánh cắp từ phòng bảo quản đặc biệt. Cửa phòng mở bằng vân tay và mã, không có dấu hiệu cạy phá.',
            'difficulty' => 4,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Giám đốc thư viện Phú', 'bio' => 'Có quyền truy cập mọi phòng, chuyên gia về bản thảo.', 'is_culprit' => false],
                ['temp_id' => 's2', 'name' => 'Nhà nghiên cứu Lan', 'bio' => 'Đang nghiên cứu bản thảo bị mất, có lịch sử truy cập.', 'is_culprit' => true],
                ['temp_id' => 's3', 'name' => 'Kỹ thuật viên Nam', 'bio' => 'Bảo trì hệ thống an ninh, biết cách vô hiệu hóa báo động.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi rở thư viện lúc 18h, có camera cổng chứng minh.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi ở phòng đọc đến 20h, sau đó về nhà.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tôi bảo trì hệ thống lúc 15h, không vào phòng bảo quản.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's2', 'content' => 'Tôi không biết mã số phòng bảo quản.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'mã'],
                ['temp_id' => 'st5', 'suspect_temp_id' => 's2', 'content' => 'Tôi không có động cơ nào để lấy bản thảo.', 'type' => 'lie', 'discovery_tier' => 2, 'trigger_keyword' => 'động cơ'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Log vân tay', 'description' => 'Vân tay Lan trên cửa phòng bảo quản lúc 20:30.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Camera hành lang', 'description' => 'Lan ra khỏi phòng đọc lúc 19:00, không quay lại.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c3', 'name' => 'Lịch sử mã số', 'description' => 'Mã của Lan dùng để mở phòng bảo quản lúc 20:30.', 'type' => 'digital', 'discovery_tier' => 1, 'trigger_keyword' => 'mã'],
                ['temp_id' => 'c4', 'name' => 'Email nhà xuất bản', 'description' => 'Lan nhận đề nghị 500 triệu để bán bản thảo "bản sao".', 'type' => 'digital', 'discovery_tier' => 2, 'trigger_keyword' => 'động cơ'],
                ['temp_id' => 'c5', 'name' => 'Thiết bị sao chép', 'description' => 'Tìm thấy máy scan chuyên dụng trong túi xách Lan.', 'type' => 'physical', 'discovery_tier' => 1, 'trigger_keyword' => 'thiết bị'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st2', 'clue_temp_id' => 'c1', 'explanation' => 'Lan nói ở phòng đọc đến 20h nhưng vân tay ở phòng bảo quản lúc 20:30.'],
                ['statement_temp_id' => 'st2', 'clue_temp_id' => 'c2', 'explanation' => 'Camera cho thấy Lan rở phòng đọc lúc 19:00, không ở đến 20h.'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c3', 'explanation' => 'Lan nói không biết mã nhưng log cho thấy Lan dùng mã mở phòng.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c4', 'explanation' => 'Lan nhận đề nghị 500 triệu cho bản thảo, có động cơ tài chính rõ ràng.'],
            ]
        ];
    }

    // ==================== CẤP 5 SAO - CỰC KHÓ ====================
    
    private function createCase5A()
    {
        return [
            'title' => 'Vụ Án Hoàn Hảo (5⭐)',
            'description' => 'Tỷ phú công nghệ chết trong phòng thí nghiệm cá nhân khóa kín. Không dấu vết xâm nhập, không chất độc, không vũ khí. Nhưng đây chắc chắn là án mạng.',
            'difficulty' => 5,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Vợ kế Julia', 'bio' => 'Tiến sĩ vật lý, thừa kế toàn bộ tài sản nếu chồng chết tự nhiên.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Đối tác kinh doanh Ken', 'bio' => 'Đang đàm phán thâu tóm công ty, cần chữ ký nạn nhân.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Trợ lý cá nhân Alex', 'bio' => 'Biết lịch trình và thói quen của nạn nhân.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi đang dự hội thảo ở Zurich, có vé máy bay và hóa đơn khách sạn.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi đến văn phòng lúc 9h để họp nhưng nạn nhân không mở cửa.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tôi giao cà phê lúc 8h, nạn nhân vẫn bình thường.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's1', 'content' => 'Tôi không hiểu biết gì về thiết bị thí nghiệm của chồng.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'thiết bị'],
                ['temp_id' => 'st5', 'suspect_temp_id' => 's1', 'content' => 'Tôi không biết chồng bị dị ứng gì.', 'type' => 'lie', 'discovery_tier' => 2, 'trigger_keyword' => 'dị ứng'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Camera sân bay', 'description' => 'Julia lên chuyến bay Zurich 1 ngày SAU khi nạn nhân chết.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Dấu vân tay', 'description' => 'Vân tay Julia trên thiết bị phát laser trong phòng thí nghiệm.', 'type' => 'physical', 'discovery_tier' => 1, 'trigger_keyword' => 'thiết bị'],
                ['temp_id' => 'c3', 'name' => 'Hồ sơ y tế', 'description' => 'Nạn nhân bị dị ứng nặng với ánh sáng laser tần số cao.', 'type' => 'document', 'discovery_tier' => 2, 'trigger_keyword' => 'dị ứng'],
                ['temp_id' => 'c4', 'name' => 'Thiết bị điều khiển', 'description' => 'Tìm thấy remote điều khiển laser trong túi xách Julia, mua 1 tuần trước.', 'type' => 'physical', 'discovery_tier' => 1, 'trigger_keyword' => 'thiết bị'],
                ['temp_id' => 'c5', 'name' => 'Email bảo hiểm', 'description' => 'Julia mua bảo hiểm nhân thọ cho chồng 10 triệu đô 1 tháng trước.', 'type' => 'digital', 'discovery_tier' => 2, 'trigger_keyword' => 'bảo hiểm'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Julia nói ở Zurich nhưng bay đi 1 ngày sau khi chồng chết, có mặt ở hiện trường.'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c2', 'explanation' => 'Julia nói không biết thiết bị nhưng vân tay có trên thiết bị laser.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c3', 'explanation' => 'Julia nói không biết dị ứng nhưng chính laser tần số cao gây sốc phản vệ cho nạn nhân.'],
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c5', 'explanation' => 'Julia mua bảo hiểm 10 triệu đô ngay trước khi chồng chết, động cơ tài chính rõ ràng.'],
            ]
        ];
    }

    private function createCase5B()
    {
        return [
            'title' => 'Vụ Mất Tích Kỳ Lạ (5⭐)',
            'description' => 'Giáo sư khảo cổ biến mất khỏi khu khai quật giữa sa mạc. Lều khóa từ bên trong, dấu chân duy nhất là của ông dẫn ra sa mạc rồi mất hút. Không xác, không dấu hiệu bạo lực.',
            'difficulty' => 5,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Trợ lý khảo cổ Sam', 'bio' => 'Học trò cưng, biết về bản đồ kho báu bí mật.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Hướng dẫn địa phương Omar', 'bio' => 'Biết sa mạc như lòng bàn tay, từng cảnh báo về cát lún.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Nhà tài trợ Victoria', 'bio' => 'Đầu tư dự án, cần kết quả để báo cáo cổ đông.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi ngủ trong lều riêng, nghe thấy tiếng giáo sư gọi từ xa lúc 3h sáng.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi cảnh báo giáo sư không đi ra sa mạc đêm, ông không nghe.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tôi ở thành phố cách 200km, có hóa đơn khách sạn.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's1', 'content' => 'Tôi không biết giáo sư giấu bản đồ kho báu ở đâu.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'bản đồ'],
                ['temp_id' => 'st5', 'suspect_temp_id' => 's1', 'content' => 'Tôi không có thiết bị gây ảo giác.', 'type' => 'lie', 'discovery_tier' => 2, 'trigger_keyword' => 'thiết bị'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Ghi âm máy ghi âm', 'description' => 'Tiếng "gọi từ xa" thực chất là ghi âm phát từ loa di động.', 'type' => 'digital', 'discovery_tier' => 1, 'trigger_keyword' => 'thiết bị'],
                ['temp_id' => 'c2', 'name' => 'Bản đồ kho báu', 'description' => 'Tìm thấy trong túi Sam, có chữ ký giáo sư và ghi chú "đừng tin Sam".', 'type' => 'document', 'discovery_tier' => 1, 'trigger_keyword' => 'bản đồ'],
                ['temp_id' => 'c3', 'name' => 'Dấu bánh xe', 'description' => 'Dấu xe jeep của Sam dẫn ra sa mạc 5km rồi quay lại lúc 2h sáng.', 'type' => 'physical', 'discovery_tier' => 0],
                ['temp_id' => 'c4', 'name' => 'Thiết bị âm thanh', 'description' => 'Loa di động và máy phát sóng siêu âm trong lều Sam.', 'type' => 'physical', 'discovery_tier' => 2, 'trigger_keyword' => 'thiết bị'],
                ['temp_id' => 'c5', 'name' => 'Nhật ký giáo sư', 'description' => 'Giáo sư nghi ngờ Sam muốn đánh cắp bản đồ, định đuổi về nước.', 'type' => 'document', 'discovery_tier' => 2, 'trigger_keyword' => 'động cơ'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Tiếng gọi là ghi âm phát từ loa, không phải giáo sư thực sự.'],
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c3', 'explanation' => 'Xe của Sam ra sa mạc lúc 2h sáng, trước khi "nghe thấy tiếng gọi".'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c2', 'explanation' => 'Sam nói không biết bản đồ nhưng tìm thấy trong túi Sam, còn có lời cảnh báo từ giáo sư.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c4', 'explanation' => 'Sam có thiết bị âm thanh và siêu âm gây ảo giác, dụ giáo sư ra sa mạc.'],
            ]
        ];
    }

    private function createCase5C()
    {
        return [
            'title' => 'Vụ Án Trên Đỉnh Everest (5⭐)',
            'description' => 'Nhà leo núi nổi tiếng chết ở trại số 4, độ cao 8000m. Không dấu hiệu bạo lực, không thiếu oxy, không tuyết lở. Chỉ có 3 ngườ trong trại lúc đó, nhưng ai cũng có chứng cứ ngoại phạm hoàn hảo.',
            'difficulty' => 5,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Hướng dẫn viên Tenzing', 'bio' => 'Ngườ dẫn đường kỳ cựu, biết rõ phản ứng cơ thể ở độ cao.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Bác sĩ đoàn Sarah', 'bio' => 'Chuyên gia y khoa cao nguyên, phụ trách sức khỏe đoàn.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Nhà báo Mike', 'bio' => 'Theo chân ghi hình, có flycam ghi lại toàn bộ.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi đang nấu ăn trong bếp, có camera GoPro ghi lại.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi kiểm tra nạn nhân lúc 18h, ông vẫn bình thường. Tôi ở lều y tế sau đó.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tôi bay flycam quanh trại từ 17h đến 19h, có footage đầy đủ.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st4', 'suspect_temp_id' => 's2', 'content' => 'Tôi không biết nạn nhân bị tiểu đường.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'bệnh'],
                ['temp_id' => 'st5', 'suspect_temp_id' => 's2', 'content' => 'Tôi không thay đổi liều thuốc của nạn nhân.', 'type' => 'lie', 'discovery_tier' => 2, 'trigger_keyword' => 'thuốc'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Footage flycam', 'description' => 'Flycam thấy Sarah vào lều nạn nhân lúc 18:30, ở 15 phút.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Hồ sơ bệnh án', 'description' => 'Nạn nhân bị tiểu đường type 1, cần insulin chính xác.', 'type' => 'document', 'discovery_tier' => 1, 'trigger_keyword' => 'bệnh'],
                ['temp_id' => 'c3', 'name' => 'Ống insulin', 'description' => 'Ống insulin trong túi nạn nhân bị pha loãng 50%, đủ gây hôn mê ở độ cao cao.', 'type' => 'physical', 'discovery_tier' => 2, 'trigger_keyword' => 'thuốc'],
                ['temp_id' => 'c4', 'name' => 'Lịch sử y khoa', 'description' => 'Sarah biết nạn nhân bị tiểu đường từ khi khám sức khỏe trước chuyến đi.', 'type' => 'document', 'discovery_tier' => 1, 'trigger_keyword' => 'bệnh'],
                ['temp_id' => 'c5', 'name' => 'Nhật ký leo núi', 'description' => 'Nạn nhân ghi Sarah liên tục hỏi về thuốc và liều lượng.', 'type' => 'document', 'discovery_tier' => 2, 'trigger_keyword' => 'thuốc'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st2', 'clue_temp_id' => 'c1', 'explanation' => 'Sarah nói ở lều y tế nhưng flycam thấy Sarah vào lều nạn nhân 15 phút.'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c2', 'explanation' => 'Sarah nói không biết nạn nhân bị tiểu đường nhưng hồ sơ cho thấy bệnh nặng type 1.'],
                ['statement_temp_id' => 'st4', 'clue_temp_id' => 'c4', 'explanation' => 'Lịch sử y khoa cho thấy Sarah biết nạn nhân bị tiểu đường từ đầu.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c3', 'explanation' => 'Insulin bị pha loãng 50% - giảm hiệu quả, gây tử vong ở độ cao 8000m.'],
                ['statement_temp_id' => 'st5', 'clue_temp_id' => 'c5', 'explanation' => 'Nạn nhân ghi Sarah hỏi nhiều về thuốc, chứng tỏ Sarah đã lên kế hoạch từ trước.'],
            ]
        ];
    }
}