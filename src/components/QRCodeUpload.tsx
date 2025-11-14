import { useState, useRef } from 'react';
import { uploadQRCode } from '../services/storageService';
import { updateMemberQRCode } from '../services/eventService';
import { useLanguage } from '../contexts/LanguageContext';

interface QRCodeUploadProps {
  eventId: string;
  memberName: string;
  currentQRCode?: string;
  onUploadSuccess?: (url: string) => void;
}

export default function QRCodeUpload({
  eventId,
  memberName,
  currentQRCode,
  onUploadSuccess,
}: QRCodeUploadProps) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentQRCode || null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('qrCode.pleaseSelectImage'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('qrCode.fileTooLarge'));
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const qrCodeURL = await uploadQRCode(eventId, memberName, file, t);
      await updateMemberQRCode(eventId, memberName, qrCodeURL);
      
      if (onUploadSuccess) {
        onUploadSuccess(qrCodeURL);
      }
    } catch (error) {
      console.error('Error uploading QR code:', error);
      alert(t('qrCode.errorUploading'));
      setPreview(currentQRCode || null);
    } finally {
      setUploading(false);
    }
  };

  const handleImageClick = () => {
    // Hiển thị ảnh lớn trong modal khi click vào ảnh
    if (preview) {
      setShowModal(true);
    }
  };

  const handleButtonClick = () => {
    // Mở file picker khi click vào nút
    fileInputRef.current?.click();
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt={`${t('qrCode.qrCodeOf')} ${memberName}`}
              className="w-12 h-12 object-cover rounded border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleImageClick}
              title={t('qrCode.clickToViewLarge')}
            />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={uploading}
          className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? t('qrCode.uploading') : preview ? t('qrCode.change') : t('qrCode.add')}
        </button>
      </div>

      {/* Modal hiển thị ảnh lớn */}
      {showModal && preview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="relative max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {t('qrCode.qrCodeOf')} {memberName}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label={t('qrCode.close')}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Ảnh */}
            <div className="p-6 flex items-center justify-center">
              <img
                src={preview}
                alt={`${t('qrCode.qrCodeOf')} ${memberName}`}
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('qrCode.clickOutsideToClose')}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

