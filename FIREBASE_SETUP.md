# Hướng dẫn Setup Firebase

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" hoặc chọn project có sẵn
3. Điền tên project và làm theo hướng dẫn
4. Chọn "Enable Google Analytics" (tùy chọn)
5. Click "Create project"

## Bước 2: Cấu hình Web App

1. Trong Firebase Console, click biểu tượng Web (`</>`)
2. Đăng ký app với nickname (ví dụ: "Split Bill Web")
3. Copy các thông tin config được hiển thị

## Bước 3: Bật Firestore Database

1. Vào **Firestore Database** trong menu bên trái
2. Click "Create database"
3. Chọn chế độ:
   - **Production mode** (khuyến nghị cho production)
   - **Test mode** (chỉ để test, sẽ hết hạn sau 30 ngày)
4. Chọn location (ví dụ: `asia-southeast1` cho Singapore)
5. Click "Enable"

## Bước 4: Tạo Firestore Indexes (QUAN TRỌNG)

**⚠️ Cần tạo 2 indexes để ứng dụng hoạt động đúng**

### Index 1: Cho collection `events` (để tìm kiếm theo accessCode)

1. Vào **Firestore Database** > **Indexes**
2. Click "Create Index"
3. Collection ID: `events`
4. Fields:
   - Field: `accessCode`
     - Order: Ascending
5. Click "Create"

### Index 2: Cho collection `expenses` (để lấy chi phí theo eventId và sắp xếp theo createdAt)

1. Vào **Firestore Database** > **Indexes**
2. Click "Create Index"
3. Collection ID: `expenses`
4. Fields:
   - Field: `eventId`
     - Order: Ascending
   - Field: `createdAt`
     - Order: Descending
5. Click "Create"

**Lưu ý**: Indexes có thể mất vài phút để được build. Bạn sẽ nhận được thông báo khi index đã sẵn sàng.

## Bước 5: Cấu hình Cloudinary cho tính năng upload QR code (MIỄN PHÍ)

Ứng dụng sử dụng **Cloudinary** để upload ảnh QR code - dịch vụ miễn phí với free tier hào phóng:
- 25GB storage
- 25GB bandwidth/tháng
- CDN tự động
- Hỗ trợ resize/optimize ảnh

### Cách setup Cloudinary:

1. **Đăng ký tài khoản miễn phí**
   - Vào https://cloudinary.com/
   - Click "Sign Up For Free"
   - Đăng ký bằng email hoặc Google/GitHub

2. **Lấy Cloud Name**
   - Sau khi đăng ký, vào Dashboard
   - Copy **Cloud Name** (hiển thị ở góc trên bên phải)

3. **Tạo Upload Preset (Unsigned)**
   - Vào **Settings** > **Upload**
   - Scroll xuống phần **Upload presets**
   - Click **"Add upload preset"**
   - Cấu hình:
     - **Preset name**: `qr-code-upload` (hoặc tên bạn muốn)
     - **Signing mode**: Chọn **"Unsigned"** (quan trọng!)
     - **Folder**: `qr-codes` (tùy chọn, để tổ chức file)
     - **Upload manipulation**: Có thể bật "Auto-format" và "Auto-quality" để tối ưu ảnh
   - Click **"Save"**

4. **Thêm vào file `.env`**:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=qr-code-upload
   ```

**Lưu ý**: 
- Cloud Name và Upload Preset là bắt buộc để upload ảnh
- Upload Preset phải được set là **Unsigned** để upload từ client-side

### Xem ảnh đã upload:

1. Vào **Media Library** trong menu bên trái Cloudinary Dashboard
2. Tất cả ảnh đã upload sẽ hiển thị ở đây
3. Nếu đã set folder `qr-codes`, bạn có thể:
   - Click vào folder `qr-codes` trong sidebar để xem ảnh trong folder đó
   - Hoặc search theo tên file để tìm ảnh cụ thể
4. Click vào ảnh để xem chi tiết và copy URL

## Bước 6: Cấu hình Security Rules (QUAN TRỌNG - BẮT BUỘC)

**⚠️ Nếu không cấu hình Security Rules, bạn sẽ gặp lỗi "Missing or insufficient permissions"**

### Firestore Rules:

1. Vào **Firestore Database** > **Rules** trong Firebase Console
2. Copy và paste rules sau vào editor:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép đọc/ghi tất cả documents trong collection 'events'
    match /events/{eventId} {
      allow read, write: if true;
    }
    
    // Cho phép đọc/ghi tất cả documents trong collection 'expenses'
    match /expenses/{expenseId} {
      allow read, write: if true;
    }
  }
}
```

3. Click **"Publish"** để lưu rules

**Lưu ý**: 
- Rules trên cho phép mọi người đọc/ghi dữ liệu, phù hợp cho development/testing
- Cho production, bạn cần rules nghiêm ngặt hơn với xác thực người dùng
- File `firestore.rules` trong project root chứa rules tương tự để deploy bằng Firebase CLI

## Bước 7: Lấy Firebase Config

1. Vào **Project Settings** (biểu tượng bánh răng)
2. Scroll xuống phần "Your apps"
3. Copy các giá trị:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## Bước 8: Cấu hình trong ứng dụng

1. Tạo file `.env` trong thư mục root của project:
```bash
cp .env.example .env
```

2. Mở file `.env` và điền các giá trị:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Cloudinary config cho tính năng upload QR code (miễn phí)
# Lấy tại: https://cloudinary.com/
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=qr-code-upload
```

3. Thay thế các giá trị `your-...` bằng giá trị thực tế:
   - Firebase config: Lấy từ Firebase Console
   - Cloudinary: Lấy Cloud Name và Upload Preset từ Cloudinary Dashboard (xem Bước 5)

## Bước 9: Test ứng dụng

1. Chạy ứng dụng:
```bash
npm run dev
```

2. Tạo một sự kiện test để kiểm tra kết nối Firebase
3. Kiểm tra Firestore Console để xem dữ liệu đã được lưu chưa

## Troubleshooting

### Lỗi: "Missing or insufficient permissions"
**Nguyên nhân**: Firestore Security Rules chưa được cấu hình hoặc không cho phép read/write

**Cách sửa**:
1. Vào Firebase Console > Firestore Database > Rules
2. Đảm bảo rules cho phép read/write cho collections `events` và `expenses`
3. Xem lại **Bước 5** ở trên để cấu hình đúng
4. Click "Publish" sau khi sửa rules
5. Refresh lại ứng dụng và thử lại

### Lỗi: "The query requires an index" hoặc "Index not found"
**Nguyên nhân**: Firestore cần composite index khi query kết hợp `where` và `orderBy` trên các field khác nhau

**Cách sửa**:
1. **Cách nhanh nhất**: Click vào link trong thông báo lỗi để tự động tạo index
2. **Cách thủ công**: 
   - Vào Firebase Console > Firestore Database > Indexes
   - Click "Create Index"
   - Tạo index theo hướng dẫn trong **Bước 4** ở trên
3. Đợi vài phút để index được build xong (Firebase sẽ gửi email khi xong)
4. Refresh lại ứng dụng và thử lại

**Indexes cần thiết**:
- `events`: `accessCode` (Ascending)
- `expenses`: `eventId` (Ascending) + `createdAt` (Descending)

### Lỗi: "Firebase: Error (auth/configuration-not-found)"
- Kiểm tra lại file `.env`
- Đảm bảo các biến môi trường bắt đầu với `VITE_`
- Restart dev server sau khi thay đổi `.env`

