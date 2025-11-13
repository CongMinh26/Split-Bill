# Split Bill App

Ứng dụng chia tiền thông minh cho nhóm đi du lịch hoặc các hoạt động chung.

## Tính năng

- ✅ Tạo sự kiện với mã truy cập ngẫu nhiên
- ✅ Tham gia sự kiện bằng mã truy cập (không cần đăng nhập)
- ✅ Thêm và quản lý chi phí
- ✅ Chia tiền công bằng theo người tham gia
- ✅ Hỗ trợ quỹ chung với tính toán tiền trả lại tự động
- ✅ Tối ưu hóa nợ để giảm số giao dịch cần thiết

## Công nghệ sử dụng

- React + TypeScript
- Vite
- Firebase (Firestore)
- React Router
- Tailwind CSS

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Cấu hình Firebase:
   - Tạo project mới trên [Firebase Console](https://console.firebase.google.com/)
   - Bật Firestore Database
   - Lấy thông tin config từ Firebase Console
   - Điền vào file `.env`

4. Tạo Firestore Index:
   - Vào Firebase Console > Firestore Database > Indexes
   - Tạo index cho collection `events` với field `accessCode` (Ascending)

5. Chạy ứng dụng:
```bash
npm run dev
```

## Cấu trúc dự án

```
src/
├── components/      # UI components
├── pages/          # Các màn hình chính
├── services/       # Firebase services
├── utils/          # Utilities và thuật toán
└── types/          # TypeScript types
```

## Hướng dẫn sử dụng

### Tạo sự kiện mới

1. Vào trang chủ, click "Tạo sự kiện mới"
2. Nhập tên người tạo và tên sự kiện
3. Thêm các thành viên
4. (Tùy chọn) Tạo quỹ chung và nhập số tiền mỗi người nộp
5. Click "Tạo sự kiện"
6. Lưu lại mã truy cập để chia sẻ với thành viên khác

### Tham gia sự kiện

1. Vào trang chủ, click "Tham gia sự kiện"
2. Nhập mã truy cập
3. Click "Tham gia"

### Thêm chi phí

1. Vào trang chi tiết sự kiện
2. Click "Thêm khoản chi"
3. Điền thông tin:
   - Tên khoản chi
   - Số tiền
   - Ai đã trả (có thể chọn "Quỹ chung" nếu có)
   - Chia cho ai
4. Click "Lưu"

### Xem kết quả

1. Vào trang chi tiết sự kiện
2. Click "Xem kết quả"
3. Xem số dư của từng người và các khoản cần thanh toán

## License

MIT
