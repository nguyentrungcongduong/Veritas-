🎯 Vision sản phẩm

Bạn đang xây dựng một:

🕵️ Detective Reasoning Platform
🎭 Đấu trí bất đối xứng giữa Thám tử vs Tội phạm
⚙️ Web app gamified (KHÔNG phải game engine)

Core fantasy:
👉 Người chơi dùng logic để phá án hoặc thiết kế vụ án đánh lừa người khác.

🧠 Core gameplay đã chốt
👮 Role: Thám tử

Loop:

vào vụ án

thu thập manh mối

dùng Evidence Board

chỉ ra mâu thuẫn

kết tội hung thủ

sai → bị penalty

Mục tiêu: tăng Detective Fame

🕶️ Role: Tội phạm

Loop:

tạo vụ án

thiết kế alibi

cài mâu thuẫn

publish case

càng nhiều người phá sai → fame càng cao

Mục tiêu: tăng Criminal Prestige

⚔️ Hình thức đối đầu

👉 Async PvP (không realtime)

Nghĩa là:

tội phạm tạo case

thám tử khác vào phá

hệ thống tự tính fame

→ Quyết định này giúp giảm độ khó kỹ thuật rất nhiều.

🚫 Những thứ đã thống nhất KHÔNG làm sớm

Đây là các bẫy bạn đã tránh đúng hướng:

❌ không làm 3D

❌ không làm game engine

❌ không realtime PvP ngay

❌ không microservice sớm

❌ không copy Conan trực tiếp

👉 Focus vào logic & UX.

🔥 Điểm khác biệt chiến lược của sản phẩm

Platform của bạn KHÔNG phải quiz thường vì có:

⭐ Contradiction system (DNA chính)

Thám tử phải:

dùng Evidence A để bác Statement B

→ biến từ đoán mò thành suy luận logic.

⭐ Evidence Corkboard

ghim manh mối

nối dây suy luận

lưu state JSONB

→ tạo cảm giác “làm thám tử thật”.

⭐ UGC Case Ecosystem

user tạo case

user khác phá

fame hai phe

→ tạo growth loop tự nhiên.

⭐ Penalty khi accuse sai

Không chỉ sai là xong — mà có giá phải trả:

trừ fame

mất token

cooldown

mất streak

→ tăng tension gameplay.

🏗 Tech stack đã chốt
Frontend

Next.js (App Router)

Tailwind

Zustand

React Flow (corkboard)

Backend

Laravel 11 (REST API)

Laravel Sanctum

Spatie Permission

Database

PostgreSQL

JSONB cho board_state

Storage

Cloudinary hoặc S3

Realtime (sau này)

Laravel Reverb / Pusher (optional)

👉 Đây là stack industry-standard và đủ scale.

🗄 Database design cốt lõi

Các bảng quan trọng:

users

cases

suspects

clues

statements

contradictions ⭐ (source of truth)

investigations (lưu board_state JSONB)

👉 Kiến trúc dữ liệu bạn chọn là đúng hướng production.

🛡 Security & Anti-cheat đã xác định

Các nguyên tắc sống còn:

không expose is_culprit

server-side validation cho accuse

lazy load manh mối

rate limit accuse

dùng public UUID (khuyến nghị)

👉 Bạn đã nghĩ đúng mindset game platform.

📈 Roadmap phát triển
Phase 1 — MVP (bắt buộc)

admin tạo case

thám tử chơi phá

accusation hoạt động

basic corkboard

⏱️ ~4–6 tuần

Phase 2 — Logic hoàn chỉnh

contradiction system full

fame calculation

polish UX

⏱️ ~2–4 tuần

Phase 3 — Creator Tools

criminal tạo case

self-solve validation

publish pipeline

⏱️ ~2–4 tuần

Phase 4 — Community & social

rating

leaderboard

comment

notification

⚠️ Rủi ro lớn nhất đã nhận diện

Teach lead highlight lại để bạn nhớ:

Evidence board UX (khó vừa)

Creator tool complexity (khó nhất)

Fame exploit/farming

Overbuilding React Flow

Gameplay không đủ “Aha moment”

👉 Đây là các điểm cần canh kỹ.