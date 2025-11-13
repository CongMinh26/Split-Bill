import { useState } from 'react';
import { createEvent } from '../services/eventService';
import { useNavigate } from 'react-router-dom';

interface EventFormProps {
  onSuccess?: (eventId: string, accessCode: string) => void;
}

export default function EventForm({ onSuccess }: EventFormProps) {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [members, setMembers] = useState<string[]>(['']);
  const [hasFund, setHasFund] = useState(false);
  const [fundContributions, setFundContributions] = useState<{ [key: string]: number }>({});
  const [createdBy, setCreatedBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMember = () => {
    setMembers([...members, '']);
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
    
    // Cập nhật fundContributions khi thêm/xóa thành viên
    if (hasFund) {
      const newFundContributions = { ...fundContributions };
      if (value) {
        if (!newFundContributions[value]) {
          newFundContributions[value] = 0;
        }
      } else {
        // Xóa thành viên cũ khỏi fundContributions nếu tên bị xóa
        const oldName = Object.keys(newFundContributions).find(
          (name, i) => i === index && !members.includes(name)
        );
        if (oldName) {
          delete newFundContributions[oldName];
        }
      }
      setFundContributions(newFundContributions);
    }
  };

  const handleRemoveMember = (index: number) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
    
    if (hasFund) {
      const removedMember = members[index];
      if (removedMember) {
        const newFundContributions = { ...fundContributions };
        delete newFundContributions[removedMember];
        setFundContributions(newFundContributions);
      }
    }
  };

  const handleFundContributionChange = (member: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setFundContributions({
      ...fundContributions,
      [member]: numValue,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!eventName.trim()) {
      setError('Vui lòng nhập tên sự kiện');
      return;
    }
    
    const validMembers = members.filter((m) => m.trim() !== '');
    if (validMembers.length < 2) {
      setError('Cần ít nhất 2 thành viên');
      return;
    }

    if (!createdBy.trim()) {
      setError('Vui lòng nhập tên người tạo');
      return;
    }

    if (hasFund) {
      const allMembersHaveFund = validMembers.every(
        (member) => fundContributions[member] && fundContributions[member] > 0
      );
      if (!allMembersHaveFund) {
        setError('Vui lòng nhập số tiền quỹ cho tất cả thành viên');
        return;
      }
    }

    setLoading(true);
    try {
      const eventId = await createEvent(
        eventName.trim(),
        validMembers,
        createdBy.trim(),
        hasFund,
        hasFund ? fundContributions : undefined
      );

      console.log(eventId,'eventId');
      
      
      // Lấy event để lấy accessCode
      const { getEventById } = await import('../services/eventService');
      const event = await getEventById(eventId);
      
      
      if (event && onSuccess) {
        onSuccess(eventId, event.accessCode);
      } else if (event) {
        navigate(`/event/${eventId}`);
      }
    } catch (err) {
      console.log(err,'err');
      
      setError('Có lỗi xảy ra khi tạo sự kiện');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Tạo sự kiện mới</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên người tạo *
          </label>
          <input
            type="text"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập tên của bạn"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên sự kiện *
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Chuyến đi Vũng Tàu 3N2Đ"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thành viên *
          </label>
          {members.map((member, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={member}
                onChange={(e) => handleMemberChange(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Thành viên ${index + 1}`}
              />
              {members.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Xóa
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddMember}
            className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            + Thêm thành viên
          </button>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="hasFund"
            checked={hasFund}
            onChange={(e) => {
              setHasFund(e.target.checked);
              if (e.target.checked) {
                // Khởi tạo fundContributions cho tất cả thành viên hiện tại
                const initialFunds: { [key: string]: number } = {};
                members.forEach((member) => {
                  if (member.trim()) {
                    initialFunds[member] = 0;
                  }
                });
                setFundContributions(initialFunds);
              }
            }}
            className="mr-2"
          />
          <label htmlFor="hasFund" className="text-sm font-medium text-gray-700">
            Tạo quỹ chung cho chuyến đi
          </label>
        </div>

        {hasFund && (
          <div className="ml-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-700 mb-3">Số tiền mỗi người nộp vào quỹ:</h3>
            {members
              .filter((m) => m.trim() !== '')
              .map((member, index) => (
                <div key={index} className="mb-2">
                  <label className="block text-sm text-gray-600 mb-1">{member}:</label>
                  <input
                    type="number"
                    value={fundContributions[member] || 0}
                    onChange={(e) => handleFundContributionChange(member, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              ))}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
        </button>
      </form>
    </div>
  );
}

