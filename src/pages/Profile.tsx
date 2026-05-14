import React from 'react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useStore } from '@/src/store/useStore';
import { User, Trophy, Flame, Target } from 'lucide-react';

export function Profile() {
  const { progress, setTargetLanguage, setGeminiApiKey } = useStore();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#5a5a40] tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-[#5a5a40]/60">Xem tiến độ học tập và quản lý cài đặt.</p>
      </header>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-[#faedcd] border border-[#d4a373]/20 rounded-full flex items-center justify-center text-[#d4a373]">
              <User className="w-12 h-12" />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#5a5a40] mb-1">Học viên Ngôn ngữ</h2>
              <p className="text-[#5a5a40]/60 font-bold uppercase tracking-widest text-xs">Tham gia: Hôm nay</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-[#fcfaf7] p-6 rounded-[24px] flex flex-col items-center justify-center border border-[#5a5a40]/10">
               <Trophy className="w-10 h-10 text-[#d4a373] mb-3" />
               <p className="text-xs font-bold uppercase tracking-widest text-[#5a5a40]/60">Cấp độ</p>
               <p className="text-3xl font-serif font-bold text-[#5a5a40] mt-1">{progress.level}</p>
            </div>
            
            <div className="bg-[#fcfaf7] p-6 rounded-[24px] flex flex-col items-center justify-center border border-[#5a5a40]/10">
               <Flame className="w-10 h-10 text-[#d4a373] mb-3" />
               <p className="text-xs font-bold uppercase tracking-widest text-[#5a5a40]/60">Chuỗi ngày</p>
               <p className="text-3xl font-serif font-bold text-[#5a5a40] mt-1">{progress.streak}</p>
            </div>

            <div className="col-span-2 md:col-span-1 bg-[#5a5a40] p-6 rounded-[24px] flex flex-col items-center justify-center text-white">
               <Target className="w-10 h-10 text-white/50 mb-3" />
               <p className="text-xs font-bold uppercase tracking-widest text-white/60">Tổng XP</p>
               <p className="text-3xl font-serif font-bold text-white mt-1">{progress.xp}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-8 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#5a5a40]">Cài đặt học tập</h3>
          
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-widest font-bold text-[#5a5a40]/60">Ngôn ngữ mục tiêu</label>
            <select 
              className="w-full p-4 border border-[#5a5a40]/20 rounded-2xl focus:ring-2 focus:ring-[#5a5a40] focus:border-transparent bg-[#f5f5f0] text-[#2d2d2a] font-medium outline-none transition-all"
              value={progress.targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              <option value="en">Tiếng Anh</option>
              <option value="ja">Tiếng Nhật</option>
              <option value="ko">Tiếng Hàn</option>
              <option value="cn">Tiếng Trung</option>
            </select>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#5a5a40]/10">
            <label className="text-xs uppercase tracking-widest font-bold text-[#5a5a40]/60">Gemini API Key (Dành cho Giáo viên AI)</label>
            <input 
              type="password"
              placeholder="Nhập API Key của bạn..."
              className="w-full p-4 border border-[#5a5a40]/20 rounded-2xl focus:ring-2 focus:ring-[#5a5a40] focus:border-transparent bg-[#f5f5f0] text-[#2d2d2a] font-medium outline-none transition-all"
              value={progress.geminiApiKey || ''}
              onChange={(e) => setGeminiApiKey(e.target.value)}
            />
            <p className="text-xs text-[#5a5a40]/60">API Key sẽ chỉ được lưu cục bộ trên trình duyệt của bạn.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-12 pb-12">
        <Button variant="danger" onClick={async () => {
          const { removeCache } = await import('@/src/lib/storage');
          await removeCache('lingua-storage');
          window.location.reload();
        }} className="w-full max-w-sm rounded-[24px] shadow-none">
          Xóa dữ liệu tiến độ (Thử nghiệm)
        </Button>
      </div>
    </div>
  );
}
