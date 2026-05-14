import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Target, Sparkles } from 'lucide-react';
import { useStore } from '@/src/store/useStore';

export function Dashboard() {
  const navigate = useNavigate();
  const { progress } = useStore();

  return (
    <div className="space-y-8">
      <header className="mb-4">
        <h1 className="font-serif text-4xl font-bold text-[#5a5a40] mb-2 tracking-tight">Chào mừng! 👋</h1>
        <p className="text-[#5a5a40]/60">Tiếp tục hành trình chinh phục ngôn ngữ của bạn.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#5a5a40] text-white border-none md:col-span-2">
          <CardContent className="pt-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-white/60 font-bold uppercase tracking-wider text-xs mb-2">Mục tiêu hằng ngày</p>
                <h3 className="font-serif text-3xl font-bold">2/3 bài</h3>
              </div>
              <Target className="w-8 h-8 opacity-50" />
            </div>
            <div className="bg-black/20 w-full h-3 rounded-full overflow-hidden">
              <div className="bg-[#d4a373] h-full w-[66%] rounded-full shadow-sm" />
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-center border-[#d4a373]/20 bg-[#faedcd]">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Sparkles className="w-8 h-8 text-[#d4a373] mb-3" />
            <div>
              <p className="text-[#5a5a40]/60 font-medium mb-1">XP Hiện tại</p>
              <h3 className="text-3xl font-bold text-[#5a5a40]">{progress.xp}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-[#5a5a40]">Làm tiếp nè</h2>
        </div>
        <div className="space-y-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/practice')}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="bg-[#f5f5f0] p-4 rounded-full text-[#5a5a40] group-hover:bg-[#5a5a40] group-hover:text-white transition-colors duration-300">
                  <PlayCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold leading-none mb-2 text-[#5a5a40]">Luyện phát âm AI</h3>
                  <p className="text-[#5a5a40]/60 text-sm">Chữa lỗi phát âm câu giao tiếp cơ bản</p>
                </div>
              </div>
              <Button className="hidden md:inline-flex">Bắt đầu ngay</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/assistant')}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="bg-[#faedcd] border border-[#d4a373]/20 p-4 rounded-full text-[#d4a373] group-hover:bg-[#d4a373] group-hover:text-white transition-colors duration-300">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold leading-none mb-2 text-[#5a5a40]">Trò chuyện với Aria</h3>
                  <p className="text-[#5a5a40]/60 text-sm">Trợ lý AI giúp bạn thiết kế lộ trình & kiểm tra bài</p>
                </div>
              </div>
              <Button variant="outline" className="hidden md:inline-flex border-[#d4a373] text-[#d4a373] hover:bg-[#d4a373] hover:text-white">Chat ngay</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/teacher')}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="bg-[#5a5a40]/10 p-4 rounded-full text-[#5a5a40] group-hover:bg-[#5a5a40] group-hover:text-white transition-colors duration-300">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold leading-none mb-2 text-[#5a5a40]">Giáo viên AI (Gemini)</h3>
                  <p className="text-[#5a5a40]/60 text-sm">Giải đáp ngữ pháp cặn kẽ, chuyên sâu</p>
                </div>
              </div>
              <Button variant="default" className="hidden md:inline-flex bg-[#5a5a40] text-white hover:bg-[#4a4a35]">Học ngay</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
