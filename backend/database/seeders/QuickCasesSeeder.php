<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class QuickCasesSeeder extends Seeder
{
    /**
     * Seed nhanh 6 vụ án cơ bản cho production deploy
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
        $mastermindId = DB::table('users')->insertGetId([
            'name' => 'Mastermind_X',
            'email' => 'mastermind@veritas.test',
            'password' => bcrypt('password'),
            'fame' => 10000,
            'prestige' => 100,
            'rank' => 'Grandmaster',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $cases = [
            $this->createCase1(), // 1⭐ Tutorial
            $this->createCase2(), // 2⭐ Trộm xe đạp
            $this->createCase3(), // 3⭐ Vụ trộm kho tiền
            $this->createCase4(), // 4⭐ Ám sát trên tàu VR
            $this->createCase5(), // 5⭐ Nghịch lý đôi giày
            $this->createCase6(), // 3⭐ Bảo tàng Laser
        ];

        foreach ($cases as $caseData) {
            $this->insertCase($caseData, $mastermindId);
        }

        $this->command->info("✅ Đã seed 6 vụ án thành công!");
    }

    private function insertCase(array $data, int $authorId)
    {
        $caseId = (string) Str::uuid();
        
        DB::table('cases')->insert([
            'id' => $caseId,
            'title' => $data['title'],
            'description' => $data['description'],
            'difficulty' => $data['difficulty'],
            'reward_fame' => $data['difficulty'] * 100,
            'status' => 'published',
            'is_solved_by_creator' => true,
            'author_id' => $authorId,
            'blueprint_data' => json_encode(['nodes' => [], 'edges' => []]),
            'created_at' => Carbon::now()->subDays(rand(1, 30)),
            'updated_at' => Carbon::now(),
        ]);

        $suspectMap = [];
        $statementMap = [];
        $clueMap = [];

        // Bulk insert suspects
        $suspectData = [];
        foreach ($data['suspects'] as $s) {
            $sId = (string) Str::uuid();
            $suspectMap[$s['temp_id']] = $sId;
            $suspectData[] = [
                'id' => $sId,
                'case_id' => $caseId,
                'name' => $s['name'],
                'bio' => $s['bio'],
                'is_culprit' => $s['is_culprit'],
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ];
        }
        if (!empty($suspectData)) {
            DB::table('suspects')->insert($suspectData);
        }

        // Bulk insert statements
        $statementData = [];
        foreach ($data['statements'] as $st) {
            $statementData[] = [
                'suspect_id' => $suspectMap[$st['suspect_temp_id']],
                'content' => $st['content'],
                'type' => $st['type'],
                'discovery_tier' => $st['discovery_tier'] ?? 0,
                'trigger_keyword' => $st['trigger_keyword'] ?? null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ];
        }
        if (!empty($statementData)) {
            DB::table('statements')->insert($statementData);
            // Get IDs for mapping
            $insertedIds = DB::table('statements')
                ->whereIn('suspect_id', array_values($suspectMap))
                ->pluck('id')
                ->toArray();
            $i = 0;
            foreach ($data['statements'] as $st) {
                $statementMap[$st['temp_id']] = $insertedIds[$i++] ?? null;
            }
        }

        // Bulk insert clues
        $clueData = [];
        foreach ($data['clues'] as $c) {
            $cId = DB::table('clues')->insertGetId([
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

        // Bulk insert contradictions
        $contradictionData = [];
        foreach ($data['contradictions'] as $con) {
            $contradictionData[] = [
                'case_id' => $caseId,
                'statement_id' => $statementMap[$con['statement_temp_id']] ?? null,
                'clue_id' => isset($con['clue_temp_id']) ? ($clueMap[$con['clue_temp_id']] ?? null) : null,
                'explanation' => $con['explanation'],
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ];
        }
        if (!empty($contradictionData)) {
            DB::table('contradictions')->insert($contradictionData);
        }
    }

    private function createCase1()
    {
        return [
            'title' => 'Tutorial: Bắt Thóp Nhanh (1⭐)',
            'description' => 'Kẻ gian đập vỡ cửa sổ trộm đồ trong siêu thị đêm. Dễ như ăn kẹo!',
            'difficulty' => 1,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Billy "Nhanh Trí"', 'bio' => 'Tệ nạn vặt quanh thị trấn.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Bà cụ dắt chó', 'bio' => 'Nhân chứng vô tình đi qua.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tối qua tôi ở nhà ngoan ngủ ngon, không bước một chân ra đường.', 'type' => 'lie', 'discovery_tier' => 0],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Mảng vải áo khoác', 'description' => 'Mảng vải hoa văn rách dính trên kính vỡ, có in chữ "Billy in the house".', 'type' => 'physical', 'discovery_tier' => 0],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Nói ở nhà nhưng áo khoác in tên lại kẹt trên kính hiện trường. Nhanh trí đến mức tự khai.'],
            ]
        ];
    }

    private function createCase2()
    {
        return [
            'title' => 'Trộm Xe Đạp Trường Học (2⭐)',
            'description' => 'Chiếc xe đạp điện mới tinh bị trộm trong khuôn viên trường.',
            'difficulty' => 2,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Hùng (Lớp trưởng)', 'bio' => 'Học sinh gương mẫu nhưng gia đình khó khăn.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Lan (Bạn nạn nhân)', 'bio' => 'Thân thiết với chủ xe.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Nam (Thủ quỹ CLB)', 'bio' => 'Ở lại đếm quỹ.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tớ về ngay sau tiếng trống.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tớ và Nam ở phòng học báo tường.', 'type' => 'truth', 'discovery_tier' => 0],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tớ khóa cổng sau lúc 17:30.', 'type' => 'truth', 'discovery_tier' => 0],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Camera cổng', 'description' => 'Hùng đi bộ ra lúc 17:45.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Camera bãi xe', 'description' => 'Hùng dắt xe điện ra lúc 17:20.', 'type' => 'digital', 'discovery_tier' => 0],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Hùng nói về ngay nhưng camera thấy ra lúc 17:45.'],
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c2', 'explanation' => 'Hùng dắt xe điện ra khỏi bãi.'],
            ]
        ];
    }

    private function createCase3()
    {
        return [
            'title' => 'Vụ Trộm Kho Tiền Công Ty Minh Thịnh (3⭐)',
            'description' => 'Tối ngày 15/02, két sắt tại kho tiền tầng hầm Công ty Minh Thịnh bị mở trái phép. 500 triệu đồng biến mất.',
            'difficulty' => 3,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Nguyễn Văn An (Thủ quỹ)', 'bio' => 'Thủ quỹ 8 năm kinh nghiệm, có nợ lớn.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Trần Thị Bích (Thư ký)', 'bio' => 'Nhân viên mới 3 tháng.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Lê Hoàng Dũng (Bảo vệ)', 'bio' => 'Trực ca đêm, có tiền sử ngủ gật.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi rở văn phòng lúc 18:30 và đi thẳng về nhà.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's1', 'content' => 'Mã truy cập của tôi đã bị thay đổi.', 'type' => 'lie', 'discovery_tier' => 1, 'trigger_keyword' => 'mã'],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Tôi ngồi phòng bảo vệ cả tối.', 'type' => 'lie', 'discovery_tier' => 0],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Camera Hành Lang B3', 'description' => 'Bóng ngườ di chuyển về kho tiền lúc 20:07.', 'type' => 'physical', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Log Hệ Thống Két Sắt', 'description' => 'Mã NAV-03 mở két lúc 20:15.', 'type' => 'digital', 'discovery_tier' => 1, 'trigger_keyword' => 'mã'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Thủ quỹ nói về nhà nhưng camera thấy ở công ty lúc 20:07.'],
                ['statement_temp_id' => 'st2', 'clue_temp_id' => 'c2', 'explanation' => 'Mã NAV-03 vẫn hoạt động, chưa bị thay đổi.'],
            ]
        ];
    }

    private function createCase4()
    {
        return [
            'title' => 'Ám Sát Trên Chuyến Tàu Ảo VR (4⭐)',
            'description' => 'Tỷ phú bị sát hại trong buồng ngủ mô phỏng VR. Hung thủ hack hệ thống cảm biến.',
            'difficulty' => 4,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Kỹ sư trưởng Kael', 'bio' => 'Ngườ thiết kế hệ thống VR.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Thư ký hờn dỗi', 'bio' => 'Ở khoang bên cạnh.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Vệ sĩ AI "B-73"', 'bio' => 'Bị sập nguồn lúc án mạng.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi đã ngắt kết nối hệ thống nhiệt độ lúc 22:00.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's3', 'content' => 'Nguồn điện của tôi bị cắt từ buồng máy chủ lúc 22:05.', 'type' => 'lie', 'discovery_tier' => 0],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Log Hệ thống nhiệt độ', 'description' => 'Hệ thống lò than vẫn hoạt động đến 22:30.', 'type' => 'digital', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Lịch cúp điện', 'description' => 'Chỉ chớp điện 1 giây lúc 22:15.', 'type' => 'physical', 'discovery_tier' => 0],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Kael nói ngắt nhiệt độ nhưng log cho thấy hoạt động đến 22:30.'],
                ['statement_temp_id' => 'st2', 'clue_temp_id' => 'c2', 'explanation' => 'AI chỉ sập vào 22:15, không phải 22:05.'],
            ]
        ];
    }

    private function createCase5()
    {
        return [
            'title' => 'Nghịch Lý Đôi Giày Sạch (5⭐)',
            'description' => 'CEO Magnus biến mất khỏi biệt thự khép kín giữa bão tuyết. Không có dấu chân ra ngoài.',
            'difficulty' => 5,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Victor (Hành xác)', 'bio' => 'Quản gia câm, đi bằng nạng.', 'is_culprit' => false],
                ['temp_id' => 's2', 'name' => 'Selena (Vợ CEO)', 'bio' => 'Ngườ cuối cùng gặp nạn nhân.', 'is_culprit' => true],
                ['temp_id' => 's3', 'name' => 'Nhiếp ảnh gia', 'bio' => 'Đang săn ảnh trước cổng.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's2', 'content' => 'Chồng tôi đã tự đi dạo ra bờ hồ.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's3', 'content' => 'Không ai từ trong nhà bước ra cả.', 'type' => 'truth', 'discovery_tier' => 0],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Đôi Giày CủCEO', 'description' => 'Giày leo núi vẫn khô ráo trên kệ.', 'type' => 'physical', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Vết kéo lê', 'description' => 'Vệt xước trên tuyết từ ban công tầng 2 xuống hồ.', 'type' => 'physical', 'discovery_tier' => 0],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'CEO không thể đi tuyết mà không mang giày.'],
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c2', 'explanation' => 'Xác bị ném từ ban công tầng 2, không phải tự đi ra.'],
            ]
        ];
    }

    private function createCase6()
    {
        return [
            'title' => 'Bóng Ma Qua Mạng Laser (4⭐)',
            'description' => 'Viên kim cương Hoàng gia bốc hơi khỏi lồng kính giăng kín 50 tia laser.',
            'difficulty' => 4,
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Đạo chích "Ngườ Không"', 'bio' => 'Có biệt tài uốn dẻo.', 'is_culprit' => false],
                ['temp_id' => 's2', 'name' => 'Bảo vệ cổng chính', 'bio' => 'Cãi nhau với đạo chích.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Trưởng ban An ninh', 'bio' => 'Thiết lập mạng lưới laser.', 'is_culprit' => true],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's3', 'content' => 'Hệ thống laser được bật liên tục.', 'type' => 'lie', 'discovery_tier' => 0],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's1', 'content' => 'Tôi có đến bảo tàng nhưng cãi nhau ở sảnh ngoài.', 'type' => 'truth', 'discovery_tier' => 0],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Biên bản kiểm tra Laser', 'description' => 'Laser ở chế độ "Bảo trì" từ phòng điều khiển.', 'type' => 'physical', 'discovery_tier' => 0],
                ['temp_id' => 'c2', 'name' => 'Camera Sảnh chính', 'description' => 'Đạo chích và bảo vệ cãi nhau lúc 23:15.', 'type' => 'digital', 'discovery_tier' => 0],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Laser bị ngắt từ phòng điều khiển, không bật liên tục.'],
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c2', 'explanation' => 'Đạo chích ở sảnh lúc laser tắt, không thể vào phòng.'],
            ]
        ];
    }
}
