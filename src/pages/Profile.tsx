import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useStore } from '@/src/store/useStore';
import { User, Trophy, Flame, Target, Database, Activity, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { get, set } from 'idb-keyval';
import { cn } from '@/src/lib/utils';

export function Profile() {
  const { progress, setTargetLanguage, setGeminiApiKey, setImageModelId, setCustomImageModels, setTextModelId, setCustomTextModels } = useStore();
  const [dbStatus, setDbStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  const [apiActivity, setApiActivity] = useState<{
    gemini: 'idle' | 'generating_text' | 'generating_image',
    pollinations: 'idle' | 'generating_text' | 'generating_image'
  }>({
    gemini: 'idle',
    pollinations: 'idle'
  });

  useEffect(() => {
    // Check IndexedDB
    const checkIDB = async () => {
      try {
        await set('__test_db__', 'test');
        const val = await get('__test_db__');
        if (val === 'test') {
          setDbStatus('active');
        } else {
          setDbStatus('inactive');
        }
      } catch (e) {
        setDbStatus('inactive');
      }
    };
    checkIDB();

    // Simulating checking API status (can be hooked to real API service interceptors in the future)
    // For now we just show idle.
  }, []);

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

          <div className="space-y-3 pt-4 border-t border-[#5a5a40]/10">
            <label className="text-xs uppercase tracking-widest font-bold text-[#5a5a40]/60">Danh sách Model ID Nội Suy (Text) tùy chỉnh</label>
            <input 
              type="text"
              placeholder="VD: openai, claude, mistral, llama"
              className="w-full p-4 border border-[#5a5a40]/20 rounded-2xl focus:ring-2 focus:ring-[#5a5a40] focus:border-transparent bg-[#f5f5f0] text-[#2d2d2a] font-medium outline-none transition-all"
              value={progress.customTextModels?.join(', ') || ''}
              onChange={(e) => setCustomTextModels(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            />
            <p className="text-xs text-[#5a5a40]/60">Nhập danh sách ID các model Text cách nhau bằng dấu phẩy. Nếu để trống sẽ sử dụng mặc định.</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#5a5a40]/10">
            <label className="text-xs uppercase tracking-widest font-bold text-[#5a5a40]/60">Pollinations Text Model (Tùy chọn mô hình Trợ lý Aria)</label>
            <select 
              className="w-full p-4 border border-[#5a5a40]/20 rounded-2xl focus:ring-2 focus:ring-[#5a5a40] focus:border-transparent bg-[#f5f5f0] text-[#2d2d2a] font-medium outline-none transition-all flex items-center justify-between"
              value={progress.textModelId || 'openai'}
              onChange={(e) => setTextModelId(e.target.value)}
            >
              {progress.customTextModels && progress.customTextModels.length > 0 ? (
                progress.customTextModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))
              ) : (
                <>
                  <option value="openai">OpenAI (Gpt-4o, Mặc định)</option>
                  <option value="openai-large">OpenAI Large (Gpt-4o-large)</option>
                  <option value="openai-reasoning">OpenAI Reasoning (o1-mini)</option>
                  <option value="claude">Claude (Claude-3.5-Sonnet)</option>
                  <option value="mistral">Mistral (Nemo)</option>
                  <option value="mistral-large">Mistral Large (Large-2407)</option>
                  <option value="llama">Llama (Llama-3.1-8B)</option>
                </>
              )}
            </select>
            <p className="text-xs text-[#5a5a40]/60">Chọn model cho trợ lý AI Aria (Pollinations.ai).</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#5a5a40]/10">
            <label className="text-xs uppercase tracking-widest font-bold text-[#5a5a40]/60">Danh sách Model ID Sinh Ảnh tùy chỉnh</label>
            <input 
              type="text"
              placeholder="VD: flux, flux-realism, midjourney"
              className="w-full p-4 border border-[#5a5a40]/20 rounded-2xl focus:ring-2 focus:ring-[#5a5a40] focus:border-transparent bg-[#f5f5f0] text-[#2d2d2a] font-medium outline-none transition-all"
              value={progress.customImageModels?.join(', ') || ''}
              onChange={(e) => setCustomImageModels(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            />
            <p className="text-xs text-[#5a5a40]/60">Nhập danh sách ID các model cách nhau bằng dấu phẩy. Nếu để trống sẽ sử dụng danh sách mặc định.</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#5a5a40]/10">
            <label className="text-xs uppercase tracking-widest font-bold text-[#5a5a40]/60">Pollinations Image Model (Tùy chọn render ảnh)</label>
            <select 
              className="w-full p-4 border border-[#5a5a40]/20 rounded-2xl focus:ring-2 focus:ring-[#5a5a40] focus:border-transparent bg-[#f5f5f0] text-[#2d2d2a] font-medium outline-none transition-all flex items-center justify-between"
              value={progress.imageModelId || 'flux'}
              onChange={(e) => setImageModelId(e.target.value)}
            >
              {progress.customImageModels && progress.customImageModels.length > 0 ? (
                progress.customImageModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))
              ) : (
                <>
                  <option value="flux">Flux (Mặc định, cân bằng)</option>
                  <option value="flux-realism">Flux Realism (Chân thực)</option>
                  <option value="flux-anime">Flux Anime (Hoạt hình Anime)</option>
                  <option value="flux-3d">Flux 3D (Đồ họa 3D)</option>
                  <option value="any-dark">Any Dark (Tối / Hơi hướng nghệ thuật)</option>
                  <option value="turbo">Turbo (Tạo siêu tốc)</option>
                </>
              )}
            </select>
            <p className="text-xs text-[#5a5a40]/60">Chọn model phù hợp nếu model hiện tại vẽ sai chữ (Lưu ý: model Flux-based thường tốt nhất cho chữ).</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-8 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#5a5a40] flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#d4a373]" />
            Trạng thái Hệ thống
          </h3>

          <div className="space-y-4">
            {/* IndexedDB Status */}
            <div className="flex items-center justify-between p-4 bg-[#fcfaf7] border border-[#5a5a40]/10 rounded-[16px]">
              <div className="flex items-center gap-3">
                <div className="bg-[#faedcd] p-2 rounded-full text-[#d4a373]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#5a5a40]">Lưu trữ IndexedDB</h4>
                  <p className="text-xs text-[#5a5a40]/60">Quản lý bộ nhớ đệm và dữ liệu</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {dbStatus === 'checking' && <span className="text-sm font-medium text-[#5a5a40]/60">Đang kiểm tra...</span>}
                {dbStatus === 'active' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    </span>
                    <span className="text-sm font-bold text-green-600">Đang hoạt động</span>
                  </>
                )}
                {dbStatus === 'inactive' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
                    <span className="text-sm font-bold text-red-600">Không khả dụng</span>
                  </>
                )}
              </div>
            </div>

            {/* Gemini API Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#fcfaf7] border border-[#5a5a40]/10 rounded-[16px] gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#5a5a40]/10 p-2 rounded-full text-[#5a5a40]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#5a5a40]">Google Gemini API</h4>
                  <p className="text-xs text-[#5a5a40]/60">AI Giáo viên & Phân tích chuyên sâu</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                   {progress.geminiApiKey ? (
                     <>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] relative flex items-center justify-center"></span>
                      <span className="text-sm font-bold text-green-600">Sẵn sàng</span>
                     </>
                   ) : (
                     <>
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"></span>
                      <span className="text-sm font-bold text-orange-600">Chưa cấu hình API Key</span>
                     </>
                   )}
                </div>
                <div className="text-[10px] uppercase font-bold text-[#5a5a40]/50 tracking-wider mt-1">
                  Chức năng: Nội suy văn bản
                </div>
              </div>
            </div>

            {/* Pollinations API Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#fcfaf7] border border-[#5a5a40]/10 rounded-[16px] gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#5a5a40]">Pollinations.ai</h4>
                  <p className="text-xs text-[#5a5a40]/60">Trợ lý Aria & Sáng tạo nội dung</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 min-h-[10px] min-w-[10px] opacity-75"></span>
                  </span>
                  <span className="text-sm font-bold text-green-600">Trực tuyến</span>
                </div>
                <div className="text-[10px] uppercase font-bold text-[#5a5a40]/50 tracking-wider mt-1 text-right">
                  Chức năng: Nội suy văn bản / Render Ảnh
                </div>
              </div>
            </div>
            
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
