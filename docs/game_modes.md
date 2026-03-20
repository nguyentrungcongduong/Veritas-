# Game Modes (Các Chế Độ Chơi)

Dự án **Veritas - The Daily Deduction** được chia thành 4 chế độ chơi khác nhau, tạo sự phân cấp thử thách từ dễ đến siêu khó, giải quyết vấn đề hao mòn nội dung (content exhaustion) và tăng độ sâu chiến thuật.

Thay vì gọi bằng những cái tên "Easy/Medium/Hard", toàn bộ được gọi bằng nghiệp vụ để duy trì phong cách Noir.

## 1. THE POLICE ACADEMY (Học viện Cảnh sát - Tutorial Mode)
Đây là nơi dành cho những "Tân binh" (Rookies) chưa biết cách nối dây hay bôi đen từ khóa.
- **Đặc điểm**: Chỉ giải các vụ án cơ bản do Ban Quản Trị (Admin) tạo sẵn.
- **Gợi ý (Hints)**: Hệ thống sẽ tự sáng lên những từ khóa quan trọng nếu người chơi bị kẹt quá lâu.
- **Hình phạt**: Không trừ Fame (Sai thoải mái để học luật chơi).
- **Mục tiêu**: Giúp người dùng thực hành hệ thống Keyword Pinpointing và 4 Loại Logic Type (Thời gian, Địa điểm, Pháp y, Chứng thực).

## 2. THE DOSSIER FEED (Hồ sơ Thường - Social Mode)
Đây là chế độ chính, nơi thám tử giải các vụ án do Dân Thường/Tội Phạm (UGC) tạo ra.
- **Đặc điểm**: Dành cho các vụ án có độ khó từ 1 sao đến 3 sao.
- **Số lần thử**: Tối đa 3 Lượt đoán (Attempts).
- **Phần thưởng**: Nhận lượng Fame ở mức trung bình.
- **Mục tiêu**: Tạo ra một dòng chảy nội dung liên tục (Content Feed) giữa người chơi với nhau.

## 3. THE RED FILE (Hồ sơ Đỏ - Hardcore/Ranked Mode)
Nơi áp lực cao nhất dành cho các "Bậc thầy suy luận". Yêu cầu Rank Thám tử tối thiểu để mở khóa.
- **Đặc điểm**: Chỉ chứa các vụ án cực khó (4 sao và 5 sao).
- **Số lần thử**: **1 LƯỢT ĐOÁN DUY NHẤT**. Đoán sai là mất trắng số Fame cược.
- **Áp lực thời gian (Pressure)**: Có đồng hồ đếm ngược sinh tử (Countdown Timer, khoảng 5-10 phút). Hết giờ coi như thất bại.
- **Yêu cầu khắt khe**: Phải chọn đúng Logic Type (🕒, 📍, 🧪, 🤐) VÀ đúng Keyword mâu thuẫn khít khao mới được tính điểm.
- **Mục tiêu**: Ném người chơi vào trạng thái "tim đập chân run", tạo sự thoả mãn tột độ khi thăng đến hạng **Legendary Detective**.

## 4. THE MASTERMIND PLANNER (Chế độ Tội Phạm)
Mặt bên kia của đồng xu Game Loop. Ở đây, người chơi đóng vai The Creator.
- **Sandbox Mode**: Tự do thiết kế hệ thống Manh mối, Lời khai, thử nghiệm các bẫy Logic và ghép các mảnh Contradiction.
- **Published Mode**: Sau khi tự Test thành công (Isolation Check pass), vụ án sẽ được xuất bản (Publish) và rơi vào *The Red File* hoặc *The Dossier Feed*. Càng nhiều người giải sai, Tội Phạm càng tăng **Infamy (Khét tiếng)**.

---

## 5. CASUAL ENTRIES (Các Chế Độ "Mềm" - Tiếp Cận Người Chơi Phổ Thông)
Để mở rộng tệp người dùng, hệ thống cung cấp các lối chơi tập trung vào Cảm xúc và Câu chuyện (Narrative-driven).

### A. THE VISUAL NOIR (Thám tử Điện ảnh)
- **Cách chơi**: Diễn ra dưới dạng Visual Novel (Truyện tranh tương tác).
- **Cơ chế**: Khi một nhân vật nói sai, màn hình rung nhẹ. Người chơi chỉ cần nhấn vào câu nói đó và chọn bằng chứng phù hợp từ danh sách gợi ý để "bẻ gãy" lời nói láo.
- **Mục tiêu**: Thưởng thức cốt truyện mà không bị áp lực về hệ thống Graph phức tạp.

### B. CSI - CRIME SCENE SEARCH (Truy tìm hiện trường)
- **Cách chơi**: Tìm kiếm vật phẩm bị ẩn (Hidden Objects) trong một không gian 2D (Point & Click).
- **Cơ chế**: Mỗi vật phẩm tìm thấy sẽ tự động "giải mã" một đoạn lời khai hoặc manh mối quan trọng.
- **Mục tiêu**: Tập trung vào tính quan sát và sự thư giãn.

### C. FLASH MYSTERY (Vụ án 1 phút)
- **Cách chơi**: Dạng câu đố siêu ngắn (giống TikTok/Shorts).
- **Cơ chế**: 1 bức ảnh + 1 câu hỏi logic duy nhất (Trắc nghiệm). 
- **Mục tiêu**: Tạo khoảnh khắc "Aha!" nhanh chóng, dùng làm nội dung lan tỏa trên mạng xã hội.

---

## 🧠 TRỢ LÝ WATSON (THE AUTO-LOGIC MENTOR)
Hệ thống hỗ trợ dành cho thám tử muốn trải nghiệm chế độ Hardcore nhưng chưa đủ kỹ năng:
- **Auto-Link**: Tự động nối dây khi người chơi chọn đúng Manh mối và Lời khai.
- **Logic Suggestion**: Gợi ý loại mâu thuẫn (Thời gian, Địa điểm...) phù hợp.
- **Cái giá**: Người chơi dùng trợ lý sẽ **không được tính vào Bảng xếp hạng (Leaderboard)** và nhận được rất ít điểm Fame.

---

## 🎨 Trải nghiệm UI (UI Experience)
Hệ thống chọn Chế Độ chơi (Mode Selection) sẽ sử dụng giao diện **"Filing Cabinet" (Tủ Hồ Sơ)** thay vì Dropdown vô hồn.
- **Ngăn kéo 1 (Màu Xanh Thép)**: Nhãn `[ACADEMY]` - Hồ sơ tân binh.
- **Ngăn kéo 2 (Màu Vàng Ố/Nâu Giấy)**: Nhãn `[ACTIVE CASES]` - Các vụ đang điều tra.
- **Ngăn kéo 3 (Màu Đỏ Máu/Niêm Phong)**: Nhãn `[DO NOT OPEN - COLD CASES]` - Dành riêng cho Ranked Mode.
