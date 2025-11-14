import { useState, useEffect } from 'react';
import { getEventById } from '../services/eventService';
import QRCodeUpload from './QRCodeUpload';
import type { Event } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface MemberQRCodeManagerProps {
  eventId: string;
}

export default function MemberQRCodeManager({ eventId }: MemberQRCodeManagerProps) {
  const { t } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await getEventById(eventId);
        setEvent(eventData);
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const handleQRUploadSuccess = async () => {
    // Reload event để lấy QR codes mới nhất
    const eventData = await getEventById(eventId);
    setEvent(eventData);
  };

  if (loading) {
    return <div className="text-sm text-gray-600 dark:text-gray-400">{t('common.loading')}</div>;
  }

  if (!event) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
        {t('qrCode.manageQRCode')}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {t('qrCode.uploadQRCodeDescription')}
      </p>
      
      <div className="space-y-4">
        {event.members.map((member) => (
          <div
            key={member}
            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-700 dark:text-gray-300">{member}</span>
              {event.memberQRCodes?.[member] && (
                <span className="text-xs text-green-600 dark:text-green-400">✓ {t('qrCode.hasQR')}</span>
              )}
            </div>
            <QRCodeUpload
              eventId={eventId}
              memberName={member}
              currentQRCode={event.memberQRCodes?.[member]}
              onUploadSuccess={handleQRUploadSuccess}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

