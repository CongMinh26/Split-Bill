import { useState, useEffect } from 'react';
import { updateMembers, updateMemberNameInEventData } from '../services/eventService';
import { updateMemberNameInExpenses } from '../services/expenseService';
import type { Event } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface EditMembersFormProps {
  event: Event;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditMembersForm({ event, onSuccess, onCancel }: EditMembersFormProps) {
  const { t } = useLanguage();
  const [members, setMembers] = useState<string[]>(event.members);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMembers(event.members);
  }, [event]);

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const handleAddMember = () => {
    setMembers([...members, '']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const validMembers = members.filter((m) => m.trim() !== '');
    if (validMembers.length < 2) {
      setError(t('editMembersForm.needAtLeast2Members'));
      return;
    }

    // Kiểm tra trùng tên
    const uniqueMembers = new Set(validMembers.map((m) => m.trim().toLowerCase()));
    if (uniqueMembers.size !== validMembers.length) {
      setError(t('editMembersForm.duplicateMemberNames'));
      return;
    }

    setLoading(true);
    try {
      // Tìm các thành viên đã thay đổi tên (so sánh theo vị trí và tên)
      const nameChanges: { oldName: string; newName: string }[] = [];
      
      // So sánh từng thành viên theo vị trí
      const minLength = Math.min(event.members.length, validMembers.length);
      for (let i = 0; i < minLength; i++) {
        const oldMember = event.members[i]?.trim();
        const newMember = validMembers[i]?.trim();
        
        // Nếu có thành viên cũ và mới, và tên khác nhau
        if (oldMember && newMember && oldMember !== newMember) {
          // Kiểm tra xem tên mới có phải là tên của thành viên khác không
          const isNewNameFromOtherMember = event.members.some(
            (m, idx) => m.trim() === newMember && idx !== i
          );
          
          // Chỉ cập nhật nếu tên mới không phải là tên của thành viên khác
          if (!isNewNameFromOtherMember) {
            nameChanges.push({ oldName: oldMember, newName: newMember });
          }
        }
      }

      // Cập nhật tên thành viên trong expense trước
      if (nameChanges.length > 0) {
        for (const change of nameChanges) {
          await updateMemberNameInExpenses(event.id, change.oldName, change.newName);
        }
      }

      // Cập nhật danh sách thành viên (bao gồm cả thành viên mới và tên đã thay đổi)
      await updateMembers(event.id, validMembers);
      
      // Cập nhật fundContributions và memberQRCodes sau khi đã cập nhật danh sách
      if (nameChanges.length > 0) {
        for (const change of nameChanges) {
          await updateMemberNameInEventData(event.id, change.oldName, change.newName);
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(t('editMembersForm.errorUpdatingMembers'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{t('editMembersForm.editMembers')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('editMembersForm.members')} *
          </label>
          {members.map((member, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={member}
                onChange={(e) => handleMemberChange(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={index === 0 ? t('editMembersForm.creatorPlaceholder') : `${t('editMembersForm.memberPlaceholder')} ${index}`}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddMember}
            className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            + {t('editMembersForm.addMember')}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">{error}</div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? t('editMembersForm.updating') : t('editMembersForm.saveChanges')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

