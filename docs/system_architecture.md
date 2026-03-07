
Bản thiết kế này tập trung vào sự linh hoạt của Next.js và sức mạnh logic của Laravel.

1. Sơ đồ Kiến trúc Tổng quát (High-Level Architecture)
code
Mermaid
download
content_copy
expand_less
graph TD
    subgraph Client_Side [Next.js - Frontend]
        UI[UI Components - Tailwind]
        RF[Evidence Board - React Flow]
        ST[State Management - Zustand]
    end

    subgraph API_Layer [Laravel - Backend]
        Auth[Sanctum Auth]
        Controller[Controllers - REST API]
        Service[Business Logic Services]
        Validator[Logic Validator Engine]
    end

    subgraph Data_Layer [Storage]
        DB[(PostgreSQL)]
        Cache[(Redis - Optional)]
        S3[Cloudinary/S3 - Media]
    end

    UI --> Auth
    UI --> Controller
    RF --> Controller
    Controller --> Service
    Service --> Validator
    Service --> DB
    Service --> S3
2. Thiết kế Database (PostgreSQL)

Chúng ta sẽ sử dụng PostgreSQL vì nó hỗ trợ JSONB, cực kỳ quan trọng để lưu tọa độ các node trên bảng manh mối.

Nhóm 1: Core Content

users: id, username, email, password, role, fame_points, rank_tier, created_at.

cases: id (UUID), author_id, title, description, thumbnail_url, difficulty (1-5), status (draft, published), is_validated (bool).

Nhóm 2: Case Entities (Phục vụ Logic)

suspects: id, case_id, name, avatar_url, is_culprit (hidden), bio.

statements: id, suspect_id, content, type (truth/lie).

clues: id, case_id, name, description, image_url, type.

contradictions: id, case_id, clue_id, statement_id, explanation. (Đây là bảng "Đáp án").

Nhóm 3: Investigation (Phục vụ Gameplay)

investigations:

id, user_id, case_id, status (investigating, solved, failed)

discovered_clues (jsonb): Danh sách ID các manh mối đã nhặt được.

board_state (jsonb): Lưu vị trí x, y và các đường nối trên React Flow.

attempts_left: Số lượt đoán còn lại.

3. Cấu trúc Backend (Laravel) - "The Logic Engine"

Để Backend không bị rối, bạn nên chia theo Service Pattern:

CaseService: Xử lý logic tạo case, upload ảnh lên Cloudinary.

ValidationService:

Hàm checkSolvability(caseId): Chạy thuật toán đồ thị để đảm bảo mọi nghi phạm (không phải hung thủ) đều có ít nhất 1 mâu thuẫn để loại trừ.

InvestigationService:

Hàm submitAccusation(userId, caseId, culpritId, evidenceChain): So khớp evidenceChain của User với bảng contradictions.

FameService: Tính toán điểm thưởng/phạt dựa trên thời gian phá án và độ khó.

4. Cấu trúc Frontend (Next.js) - "The Experience"

Tận dụng App Router và Server Components:

/app/(criminal)/builder: Sử dụng Zustand để quản lý State của Wizard 5 bước. Tránh việc mỗi bước lại gọi API, chỉ Save Draft khi cần.

/app/(detective)/board/[id]:

Dùng React Flow làm layer chính.

Custom Nodes: Mỗi manh mối là một node, mỗi lời khai là một node.

Edges: Khi user nối dây đỏ, lưu event đó vào local state trước khi nhấn "Confirm".

/components/shared: Các UI component như EvidenceCard, SuspectProfile, Notification.

5. API Design (Các Endpoint quan trọng)
Method	Endpoint	Description
POST	/api/cases	Tạo draft case mới
PATCH	/api/cases/{id}/logic	Cập nhật bảng mâu thuẫn (Contradiction)
POST	/api/cases/{id}/validate	Chạy bộ check tự động và Self-solve
GET	/api/detective/clues	Lấy manh mối thám tử đã thu thập được (Lazy load)
POST	/api/detective/accuse	Gửi bằng chứng và chỉ định hung thủ
6. Chiến lược Bảo mật (Anti-Cheat)

Đây là phần "sống còn" cho game giải đố:

Hiding the Culprit: Endpoint GET /api/cases/{id} trả về danh sách Suspects nhưng không có field is_culprit.

Logic Decoupling: Thám tử không bao giờ biết được contradiction_id. Khi họ nối dây trên UI, Next.js chỉ gửi clue_id và statement_id. Laravel sẽ tự so khớp trong DB.

Encrypted Evidence: Nếu muốn hardcore hơn, nội dung manh mối chỉ được giải mã (decrypt) trên Server khi User thỏa mãn điều kiện tìm thấy nó.

7. Luồng dữ liệu "Self-Solve" (Quan trọng nhất)

Criminal hoàn thành thiết kế -> Nhấn "Verify".

Laravel kiểm tra cấu trúc (Đủ nghi phạm chưa? Có mâu thuẫn chưa?).

Next.js chuyển Criminal sang giao diện "Playtest".

Criminal phải phá thành công vụ án của chính mình.

Laravel nhận được yêu cầu phá án đúng -> Set cases.status = 'published'.

💡 Lời khuyên cho bạn khi bắt đầu:

Backend trước: Hãy hoàn thành các Migration và Model trong Laravel. Viết thử 1 Case bằng tay vào DB.

UI Board sau: Đừng quá sa đà vào React Flow ngay lập tức. Hãy làm giao diện liệt kê Manh mối bằng danh sách (List) trước để test logic phá án thành công/thất bại. Khi logic đã chạy, mới đưa lên Board.

Tên dự án: Bạn đã chọn được cái tên nào trong danh sách hôm nọ chưa? (Ví dụ: LogicNode hay Deduction.io?)

Bạn có muốn mình viết mẫu đoạn code "ValidationService" trong Laravel để kiểm tra xem một vụ án có đủ logic để phá hay không không? Đây là phần cốt lõi của hệ thống đấy!