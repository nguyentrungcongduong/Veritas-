<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;
use DB;

class MastermindCollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cases = [
            // Ám sát trên tàu VR - 4 sao
            $this->createTrainCase(),
            // Vụ mất tích của CEO công nghệ - 5 sao
            $this->createTechCEOCase(),
            // Vụ trộm tại Bảo tàng Laser - 4 sao
            $this->createMuseumCase(),
            // Vụ án trong phòng Lab - 3 sao
            $this->createLabCase(),
            // Tutorial - 1 sao
            $this->createTutorialCase(),
        ];

        foreach ($cases as $caseData) {
            $this->insertCase($caseData);
        }

        echo "✅ Đã gieo rắc 5 vụ án 'The Mastermind Collection' thành công!\n";
    }

    private function insertCase(array $data)
    {
        $caseId = (string) Str::uuid();
        
        // 1. Insert Case
        DB::table('cases')->insert([
            'id' => $caseId,
            'title' => $data['title'],
            'description' => $data['description'],
            'difficulty' => $data['difficulty'],
            'status' => 'published',
            'is_solved_by_creator' => true,
            'blueprint_data' => json_encode($data['blueprint_data']),
            'created_at' => Carbon::now()->subDays(rand(1, 30)),
            'updated_at' => Carbon::now(),
        ]);

        // Mappings for DB insert
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
            $stId = DB::table('statements')->insertGetId([
                'suspect_id' => $suspectMap[$st['suspect_temp_id']],
                'content' => $st['content'],
                'type' => $st['type'],
                'discovery_tier' => $st['discovery_tier'] ?? 1,
                'trigger_keyword' => $st['trigger_keyword'] ?? null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            $statementMap[$st['temp_id']] = $stId;
        }

        // 4. Insert Clues
        foreach ($data['clues'] as $c) {
            $cId = DB::table('clues')->insertGetId([
                'case_id' => $caseId,
                'name' => $c['name'],
                'description' => $c['description'],
                'type' => $c['type'],
                'discovery_tier' => $c['discovery_tier'] ?? 1,
                'trigger_keyword' => $c['trigger_keyword'] ?? null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            $clueMap[$c['temp_id']] = $cId;
        }

        // 5. Insert Contradictions
        foreach ($data['contradictions'] as $con) {
            DB::table('contradictions')->insert([
                'case_id' => $caseId,
                'statement_id' => $statementMap[$con['statement_temp_id']],
                'clue_id' => isset($con['clue_temp_id']) ? $clueMap[$con['clue_temp_id']] : null,
                'explanation' => $con['explanation'],
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }

    private function createTrainCase()
    {
        return [
            'title' => 'Ám Sát Trên Chuyến Tàu Ảo VR (4 Stars)',
            'description' => 'Một tỷ phú bị sát hại trong buồng ngủ mô phỏng khi đang trải nghiệm chuyến tàu Orient Express phiên bản VR. Hung thủ đã hack vào hệ thống cảm biến sinh học.',
            'difficulty' => 4,
            'blueprint_data' => [
                'nodes' => [], 'edges' => [] // Giả lập blueprint
            ],
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Kỹ sư trưởng Kael', 'bio' => 'Người thiết kế hệ thống VR.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Thư ký hờn dỗi', 'bio' => 'Người có mặt ở khoang bên cạnh.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Vệ sĩ AI "B-73"', 'bio' => 'Bảo vệ riêng, bị sập nguồn lúc án mạng.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tôi đã ngắt kết nối hệ thống nhiệt độ lò than mô phỏng lúc 22:00, không thể có chuyện hệ thống đó gây bỏng ngoài đời thực.', 'type' => 'lie'],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's2', 'content' => 'Tôi nghe thấy tiếng còi tàu mô phỏng hụ lên liên tục vào lúc 22:15.', 'type' => 'truth'],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's3', 'content' => 'Nguồn điện của tôi bị cắt từ buồng máy chủ lúc 22:05.', 'type' => 'lie'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Log Hệ thống nhiệt độ', 'description' => 'Hệ thống lò than vẫn hoạt động công suất tối đa đến 22:30. Nhiệt độ truyền qua bộ suit đạt ngưỡng chết người.', 'type' => 'digital'],
                ['temp_id' => 'c2', 'name' => 'Lịch cúp điện buồng máy chủ', 'description' => 'Buồng máy chủ chỉ chớp điện 1 giây lúc 22:15 do loa mô phỏng còi tàu kéo quá tải.', 'type' => 'physical'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Kael nói dối về việc ngắt nhiệt độ. Log chứng minh anh ta cố tình tăng nhiệt để giết nạn nhân.'],
                ['statement_temp_id' => 'st3', 'clue_temp_id' => 'c2', 'explanation' => 'AI B-73 không bị sập từ 22:05. Nó chỉ sập vào 22:15 do tiếng còi. AI đang che giấu thời gian thực vì nó tiếp tay cho Kael.'],
            ]
        ];
    }

    private function createTechCEOCase()
    {
        return [
            'title' => 'Nghịch Lý Đôi Giày Sạch (5 Stars)',
            'description' => 'CEO Magnus biến mất khỏi biệt thự khép kín giữa một đêm bão tuyết. Không có dấu chân nào dẫn ra ngoài, nhưng camera lại thấy ông bước vào.',
            'difficulty' => 5,
            'blueprint_data' => ['nodes' => [], 'edges' => []],
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Victor (Hành xác)', 'bio' => 'Quản gia câm, đi lại không tạo nốt chân do đi bằng nạng.', 'is_culprit' => false],
                ['temp_id' => 's2', 'name' => 'Selena (Vợ CEO)', 'bio' => 'Người cuối cùng gặp nạn nhân, thừa kế toàn bộ.', 'is_culprit' => true],
                ['temp_id' => 's3', 'name' => 'Nhiếp ảnh gia', 'bio' => 'Đang đứng canh trước cổng để săn ảnh.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's2', 'content' => 'Chồng tôi đã tự đi dạo ra bờ hồ giữa tâm tuyết, ông ấy thường vậy khi stress.', 'type' => 'lie'],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's3', 'content' => 'Tôi đứng canh cổng gác suốt đêm, tuyết phủ trắng xóa, không ai từ trong nhà bước ra cả.', 'type' => 'truth'],
                ['temp_id' => 'st3', 'suspect_temp_id' => 's1', 'content' => 'Bà chủ mang một đôi boots phủ đầy tuyết vào phòng sưởi lúc nửa đêm.', 'type' => 'truth', 'discovery_tier' => 2, 'trigger_keyword' => 'boots'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Đôi Giày Của CEO', 'description' => 'Đôi giày leo núi sưởi ấm duy nhất của CEO vẫn nằm khô ráo trên kệ giày, hoàn toàn không có dấu hiệu bị ướt.', 'type' => 'physical'],
                ['temp_id' => 'c2', 'name' => 'Vết kéo lê', 'description' => 'Một vệt xước trên tuyết bị lấp một phần bởi bão, hướng từ ban công tầng 2 bay thẳng xuống hồ.', 'type' => 'physical'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Đôi giày đi tuyết duy nhất vẫn khô. CEO không thể đi dạo dưới bão tuyết mà không mang giày sưởi. Vợ ông đang nói dối.'],
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c2', 'explanation' => 'CEO không tự đi ra. Vệt kéo lê cho thấy xác bị ném thẳng từ ban công tầng 2 xuống hồ.'],
            ]
        ];
    }

    private function createMuseumCase()
    {
        return [
            'title' => 'Bóng Ma Qua Mạng Laser (4 Stars)',
            'description' => 'Viên kim cương Hoàng gia bốc hơi khỏi lồng kính giữa căn phòng giăng kín 50 tia laser cảm biến. Không còi báo động nào vang lên.',
            'difficulty' => 4,
            'blueprint_data' => ['nodes' => [], 'edges' => []],
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Đạo chích "Người Không Bóp Bóng"', 'bio' => 'Kẻ bị tình nghi số 1 có biệt tài uốn dẻo.', 'is_culprit' => false],
                ['temp_id' => 's2', 'name' => 'Bảo vệ cổng chính', 'bio' => 'Đấu khẩu gắt gao với đạo chích lúc mất điện.', 'is_culprit' => false],
                ['temp_id' => 's3', 'name' => 'Trưởng ban An ninh', 'bio' => 'Thiết lập mạng lưới laser.', 'is_culprit' => true],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's3', 'content' => 'Hệ thống laser được bật liên tục. Tên đạo chích kia chắc chắn đã dùng kĩ thuật uốn dẻo để chui qua.', 'type' => 'lie'],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's1', 'content' => 'Tôi có đến bảo tàng, nhưng tôi cãi nhau với bảo vệ ở sảnh ngoài suốt từ 23:00 đến 23:30.', 'type' => 'truth'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Biên bản kiểm tra Laser', 'description' => 'Hệ thống laser được đặt ở chế độ "Bảo trì" từ phòng điều khiển trong đúng 1 phút lúc 23:15.', 'type' => 'physical'],
                ['temp_id' => 'c2', 'name' => 'Camera Sảnh chính', 'description' => 'Ghi lại cảnh tên đạo chích và bảo vệ mải mê cãi nhau lúc 23:15, cả hai đều có mặt ở sảnh.', 'type' => 'digital'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Laser không bật liên tục. Nó bị ngắt từ bên trong phòng điều khiển. Hệ thống bị thao túng bởi người nội bộ.'],
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c2', 'explanation' => 'Đạo chích ở sảnh lúc laser tắt, không thể vào phòng lấy trộm. Trưởng ban An ninh đã tự ngắt laser và đánh cắp.'],
            ]
        ];
    }

    private function createLabCase()
    {
        return [
            'title' => 'Bữa Trưa Kịch Độc (3 Stars)',
            'description' => 'Một nhà khoa học chết úp mặt vào khay cơm trưa trong phòng Lab kín.',
            'difficulty' => 3,
            'blueprint_data' => ['nodes' => [], 'edges' => []],
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Trợ lý khoa học', 'bio' => 'Người mang cơm trưa vào.', 'is_culprit' => false],
                ['temp_id' => 's2', 'name' => 'Nghiên cứu sinh đối thủ', 'bio' => 'Ghét cay ghét đắng nạn nhân.', 'is_culprit' => true],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's2', 'content' => 'Tôi chỉ đứng ở hành lang hút thuốc, không hề bước chân vào phòng lab suốt trưa.', 'type' => 'lie'],
                ['temp_id' => 'st2', 'suspect_temp_id' => 's1', 'content' => 'Tôi mang khay cơm đặt lên bàn lúc 12:00 rồi ra ngoài ngay, cửa phòng Lab là loại cửa trượt tự động.', 'type' => 'truth'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Tàn thuốc lá', 'description' => 'Một vệt tàn thuốc lá dính trên mép cửa trượt TỰ ĐỘNG - phía BÊN TRONG phòng Lab.', 'type' => 'physical'],
                ['temp_id' => 'c2', 'name' => 'Dịch hạch tố', 'description' => 'Chất độc không tan trong thức ăn nóng, chỉ bay hơi khi rắc vào súp.', 'type' => 'physical'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Hắn nói không vào phòng, nhưng tàn thuốc của hắn lại kẹt ở rìa trong của cửa trượt tự động. Hắn đã chui qua lúc cửa đang đóng để vào bỏ độc.'],
            ]
        ];
    }

    private function createTutorialCase()
    {
        return [
            'title' => 'Vụ Án Tutorial: Bắt Thóp Nhanh (1 Star)',
            'description' => 'Kẻ gian đập vỡ cửa sổ trộm đồ trong siêu thị đêm.',
            'difficulty' => 1,
            'blueprint_data' => ['nodes' => [], 'edges' => []],
            'suspects' => [
                ['temp_id' => 's1', 'name' => 'Billy "Nhanh Trí"', 'bio' => 'Tệ nạn vặt quanh thị trấn.', 'is_culprit' => true],
                ['temp_id' => 's2', 'name' => 'Bà cụ dắt chó', 'bio' => 'Nhân chứng vô tình đi qua.', 'is_culprit' => false],
            ],
            'statements' => [
                ['temp_id' => 'st1', 'suspect_temp_id' => 's1', 'content' => 'Tối qua tôi ở nhà ngoan ngủ ngon, không bước một chân ra đường.', 'type' => 'lie'],
            ],
            'clues' => [
                ['temp_id' => 'c1', 'name' => 'Mảng vải áo khoác', 'description' => 'Mảng vải hoa văn rách dính trên kính vỡ, có in chữ "Billy in the house".', 'type' => 'physical'],
            ],
            'contradictions' => [
                ['statement_temp_id' => 'st1', 'clue_temp_id' => 'c1', 'explanation' => 'Nói ở nhà nhưng áo khoác in tên lại kẹt trên kính hiện trường. Nhanh trí đến mức tự khai.'],
            ]
        ];
    }
}
