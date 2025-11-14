/**
 * Upload ảnh QR code sử dụng Cloudinary (miễn phí)
 * 
 * Cloudinary là dịch vụ upload ảnh miễn phí với free tier hào phóng:
 * - 25GB storage
 * - 25GB bandwidth/tháng
 * - CDN tự động
 * - Hỗ trợ resize/optimize ảnh
 * 
 * Để setup Cloudinary:
 * 1. Đăng ký tài khoản miễn phí tại https://cloudinary.com/
 * 2. Vào Dashboard > Settings > Upload
 * 3. Tạo Upload Preset mới:
 *    - Signing mode: Unsigned (để upload từ client-side)
 *    - Folder: qr-codes (tùy chọn)
 * 4. Copy Cloud Name và Upload Preset vào file .env
 */

// Cấu hình Cloudinary từ environment variables
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload ảnh QR code cho thành viên sử dụng Cloudinary
 * @param eventId - ID của event (dùng để tạo folder path)
 * @param memberName - Tên thành viên (dùng để tạo file name)
 * @param file - File ảnh cần upload
 * @param t - Translation function (optional)
 */
export async function uploadQRCode(
  eventId: string,
  memberName: string,
  file: File,
  t?: (key: string) => string
): Promise<string> {
  const getMessage = (key: string, defaultMsg: string) => {
    if (t) {
      const translated = t(key);
      return translated !== key ? translated : defaultMsg;
    }
    return defaultMsg;
  };

  if (!cloudName || !uploadPreset) {
    throw new Error(
      getMessage(
        'storage.cloudinaryNotConfigured',
        'Cloudinary chưa được cấu hình. Vui lòng thêm VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET vào file .env'
      )
    );
  }

  try {
    // Tạo file name unique
    const timestamp = Date.now();
    const fileName = `${memberName}-${timestamp}`;
    
    // Upload to Cloudinary (unsigned upload)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', `qr-codes/${eventId}`);
    formData.append('public_id', fileName);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Return secure URL (HTTPS)
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    const errorMessage = error instanceof Error ? error.message : getMessage('storage.cannotUploadImage', 'Không thể upload ảnh');
    const uploadFailed = getMessage('storage.uploadFailed', 'Upload thất bại');
    const checkConfig = getMessage('storage.checkCloudinaryConfig', 'Vui lòng kiểm tra cấu hình Cloudinary hoặc thử lại.');
    throw new Error(`${uploadFailed}: ${errorMessage}. ${checkConfig}`);
  }
}

/**
 * Xóa QR code từ Cloudinary
 * 
 * Lưu ý: Với unsigned upload preset, không thể xóa ảnh từ client-side vì cần API Secret.
 * Function này chỉ để tương thích với interface, nhưng sẽ không thực sự xóa ảnh.
 * Để xóa ảnh, bạn cần:
 * 1. Sử dụng signed upload preset (cần backend)
 * 2. Hoặc xóa trực tiếp từ Cloudinary Dashboard
 * 
 * @param _imageUrl - URL của ảnh cần xóa (không dùng với unsigned preset)
 * @param t - Translation function (optional)
 */
export async function deleteQRCode(
  _imageUrl: string,
  t?: (key: string) => string
): Promise<void> {
  const getMessage = (key: string, defaultMsg: string) => {
    if (t) {
      const translated = t(key);
      return translated !== key ? translated : defaultMsg;
    }
    return defaultMsg;
  };

  // Với unsigned upload preset, không thể xóa ảnh từ client-side
  // Ảnh cũ sẽ được thay thế bằng URL mới trong Firestore khi upload ảnh mới
  const warningMsg = getMessage(
    'storage.cannotDeleteWithUnsignedPreset',
    'Cloudinary với unsigned preset không hỗ trợ xóa ảnh từ client-side. Ảnh cũ sẽ được thay thế bằng URL mới trong Firestore khi upload ảnh mới.'
  );
  console.warn(warningMsg);
}

