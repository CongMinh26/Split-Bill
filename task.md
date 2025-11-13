================ Case 1 ================
Tái hiện một chuyến du lịch (Ví dụ 4 người: An, Bình, Cường, Dũng)
Hãy xem thiết kế 4 màn hình đó xử lý chuyến đi "khó" này như thế nào:

1. Bắt đầu chuyến đi (Màn hình 1 & 2)
An (trưởng nhóm) mở app, bấm "+".

Tạo sự kiện: "Chuyến đi Vũng Tàu 3N2Đ".

Thêm người: An, Bình, Cường, Dũng.

Bấm "Lưu". Lúc này, một "sự kiện" được tạo ra và tồn tại trong 3 ngày.

2. Các chi phí phát sinh (Màn hình 3 - Lặp đi lặp lại)
Đây là màn hình chính của sự kiện. Nó sẽ là một danh sách các khoản chi.

Ngày 1 (Sáng): An đổ 500.000 VNĐ tiền xăng cho cả nhóm.

An mở app (vào sự kiện Vũng Tàu), bấm "Thêm khoản chi".

Tên: "Xăng xe"

Tiền: 500.000

Ai trả: An

Chia cho: [Chia cho tất cả] (mặc định)

Bấm "Lưu". (Mất 10 giây)

Ngày 1 (Trưa): Bình trả tiền ăn trưa 800.000 VNĐ cho cả nhóm.

Bình mở app, bấm "Thêm khoản chi".

Tên: "Ăn trưa"

Tiền: 800.000

Ai trả: Bình

Chia cho: [Chia cho tất cả]

Bấm "Lưu".

Ngày 1 (Tối): Đi ăn hải sản. Tổng 1.200.000 VNĐ.

Trong đó có 300.000 VNĐ tiền bia (chỉ An, Bình uống).

Cường trả toàn bộ 1.200.000 VNĐ.

Cường sẽ nhập 2 khoản chi riêng biệt:

Tên: "Hải sản" | Tiền: 900.000 | Ai trả: Cường | Chia cho: [Tất cả]

Tên: "Bia" | Tiền: 300.000 | Ai trả: Cường | Chia cho: [Chọn người...] -> (Tick chọn An, Bình)

Ngày 2 (Sáng): Dũng mua vé cáp treo 400.000 VNĐ, nhưng Cường không đi.

Dũng mở app, bấm "Thêm khoản chi".

Tên: "Vé cáp treo"

Tiền: 400.000

Ai trả: Dũng

Chia cho: [Chọn người...] -> (Tick chọn An, Bình, Dũng - bỏ tick Cường)

Bấm "Lưu".

... Cứ như vậy cho đến cuối chuyến đi.

3. Kết thúc chuyến đi (Màn hình 4 - Điều kỳ diệu)
Đây là phần "tổng hợp" mà bạn nói. Sau khi tất cả các khoản chi đã được nhập, mọi người chỉ cần mở màn hình "Kết quả" (hay "Tổng kết").

Người dùng không cần làm gì cả. Ứng dụng sẽ tự động chạy một thuật toán để "tối ưu hóa nợ".

Thay vì hiển thị một ma trận phức tạp (An nợ Bình, Bình nợ Cường, Cường nợ An...), nó sẽ tính toán và chỉ hiển thị các khoản nợ cuối cùng và đơn giản nhất.

Ví dụ kết quả có thể là:

Dũng cần trả cho An: 150.000 VNĐ

Bình cần trả cho Cường: 320.000 VNĐ

... và thế là xong! Chỉ cần 2 giao dịch là cả nhóm huề tiền.


================ Case 2 ================
Sau khi bạn tạo sự kiện ("Chuyến đi Vũng Tàu") và thêm tên (An, Bình, Cường, Dũng), ứng dụng sẽ có thêm một bước:

Hỏi: "Bạn có muốn tạo Quỹ chung cho chuyến đi không?"

Nếu bạn chọn [ Có ], một màn hình mới hiện ra để bạn nhập số tiền mọi người nộp vào quỹ:

An: [ 1.000.000 ] VNĐ

Bình: [ 1.000.000 ] VNĐ

Cường: [ 1.000.000 ] VNĐ

Dũng: [ 1.000.000 ] VNĐ

Ứng dụng sẽ hiển thị: "Tổng quỹ: 4.000.000 VNĐ".

📱 Màn hình 3 (Sửa đổi): Thêm khoản chi (Từ Quỹ chung)
Đây là thay đổi quan trọng nhất để giải quyết bài toán của bạn.

Khi bạn bấm "Thêm khoản chi", mục "Ai đã trả?" sẽ được bổ sung:

Tên khoản chi: "Xăng xe"

Số tiền: "500.000"

Ai đã trả? (Đây là điểm mấu chốt)

An

Bình

Cường

Dũng

Quỹ chung <-- Đây là lựa chọn mới và quan trọng

Chia cho ai? [Chia cho tất cả]

Khi người giữ tiền (thường là thủ quỹ) chi 500.000 tiền xăng từ tiền chung, họ sẽ chọn "Ai đã trả?" là "Quỹ chung".

Lúc này, ứng dụng sẽ tự động trừ: "Quỹ chung còn lại: 3.500.000 VNĐ".

💡 Xử lý tình huống (Case) cuối chuyến đi
Đây là phần "tính toán và trả lời" mà bạn muốn. Cuối chuyến đi, mọi người mở Màn hình 4 (Kết quả).

Giả sử chuyến đi của nhóm (An, Bình, Cường, Dũng) như sau:

Mỗi người góp 1.000.000 VNĐ (Tổng quỹ: 4.000.000 VNĐ).

Chi từ quỹ:

Ăn chung: 2.000.000 VNĐ (Chia 4)

Bia: 500.000 VNĐ (Chỉ An và Bình uống)

Tổng chi: 2.500.000 VNĐ.

Tiền thừa trong quỹ: 4.000.000 - 2.500.000 = 1.500.000 VNĐ.

Câu hỏi đặt ra là: Chia 1.500.000 VNĐ tiền thừa này cho ai? (Nếu chia đều mỗi người 375.000 VNĐ là SAI, vì Cường và Dũng không uống bia).

Ứng dụng của bạn sẽ tự động tính toán "chi phí công bằng" (fair share) của từng người:

Tính chi phí thực tế của mỗi người:

Tiền ăn: 2.000.000 / 4 = 500.000 VNĐ/người.

Tiền bia: 500.000 / 2 = 250.000 VNĐ/người (chỉ An, Bình).

=> Chi phí thực của An: 500k (ăn) + 250k (bia) = 750.000 VNĐ

=> Chi phí thực của Bình: 500k (ăn) + 250k (bia) = 750.000 VNĐ

=> Chi phí thực của Cường: 500k (ăn) + 0 (bia) = 500.000 VNĐ

=> Chi phí thực của Dũng: 500k (ăn) + 0 (bia) = 500.000 VNĐ

Tính toán tiền trả lại (Màn hình 4): Ứng dụng sẽ lấy (Tiền đã nộp) - (Chi phí thực) = (Tiền được trả lại).

An: 1.000.000 (nộp) - 750.000 (chi) = Nhận lại 250.000 VNĐ

Bình: 1.000.000 (nộp) - 750.000 (chi) = Nhận lại 250.000 VNĐ

Cường: 1.000.000 (nộp) - 500.000 (chi) = Nhận lại 500.000 VNĐ

Dũng: 1.000.000 (nộp) - 500.000 (chi) = Nhận lại 500.000 VNĐ

(Tổng tiền trả lại: 250 + 250 + 500 + 500 = 1.500.000 VNĐ, khớp với tiền thừa trong quỹ).

Kết luận: Màn hình kết quả sẽ "trả lời" cho người dùng rất rõ ràng: "Quỹ chung còn 1.500.000 VNĐ. Đề xuất chia tiền thừa như sau:

Trả Cường: 500.000 VNĐ

Trả Dũng: 500.000 VNĐ

Trả An: 250.000 VNĐ

Trả Bình: 250.000 VNĐ"