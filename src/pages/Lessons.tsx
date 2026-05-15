import React, { useState, useEffect } from 'react';
import { askAI } from '@/src/services/aiService';
import { useStore } from '@/src/store/useStore';
import { Book, Loader2, PlayCircle, Plus, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/src/components/ui/Card';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';

// Static levels list
const LEVELS = [
  { id: '1', level: 'Beginner', title: 'Nhập môn (Level 1)', desc: 'Làm quen với bảng chữ cái, phát âm cơ bản và từ vựng thông dụng giao tiếp hằng ngày.' },
  { id: '2', level: 'Elementary', title: 'Sơ cấp (Level 2)', desc: 'Cấu trúc câu đơn giản, đàm thoại về chủ đề quen thuộc gia đình, sở thích.' },
  { id: '3', level: 'Intermediate', title: 'Trung cấp (Level 3)', desc: 'Trình bày ý kiến cá nhân, ngữ pháp phức tạp, và kỹ năng viết thư.' },
  { id: '4', level: 'Advanced', title: 'Cao cấp (Level 4)', desc: 'Sử dụng ngôn ngữ tự nhiên như người bản xứ, phân tích tài liệu học thuật.' },
];

export function Lessons() {
  const { progress } = useStore();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const loadLesson = async (level: string) => {
    setSelectedLevel(level);
    setIsLoading(true);
    setLessonContent('');

    const targetLang = progress.targetLanguage;
    const system = `Bạn là chuyên gia giáo viên ngoại ngữ. Nhiệm vụ của bạn là soạn một bài học tóm tắt cực kì sinh động và dễ hiểu cho cấp độ ${level} ngôn ngữ mã '${targetLang}'.`;
    const prompt = `Hãy soạn một bài học về: 
1. 5 từ vựng/cụm từ thông dụng nhất ở cấp độ này kèm ví dụ. 
2. 1 điểm ngữ pháp trọng tâm và cách dùng. 
3. 2 đoạn hội thoại ngắn để ứng dụng.
Hãy format bằng Markdown đẹp đẽ, có emoji minh hoạ, bảng biểu nếu cần. Trả lời hoàn toàn bằng tiếng Việt.`;
    
    try {
      const content = await askAI(system, prompt);
      setLessonContent(content);
    } catch (err) {
      setLessonContent('Lỗi khi tải bài học. Bạn thử lại nhé!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
         <h1 className="font-serif text-3xl font-bold text-[#5a5a40]">Bài học của bạn</h1>
         <span className="bg-[#faedcd] text-[#d4a373] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-[#d4a373]/20">
           {progress.targetLanguage.toUpperCase()}
         </span>
      </div>

      {!selectedLevel ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {LEVELS.map((item) => (
            <Card 
              key={item.id} 
              className="hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1 border border-[#5a5a40]/10 hover:border-[#d4a373]/50"
              onClick={() => loadLesson(item.level)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-[#f5f5f0] p-3 rounded-2xl group-hover:bg-[#faedcd] transition-colors text-[#5a5a40] group-hover:text-[#d4a373]">
                    <Book className="w-6 h-6" />
                  </div>
                  <CheckCircle2 className={cn("w-5 h-5", parseInt(item.id) < progress.level ? "text-green-500" : "text-[#5a5a40]/20")} />
                </div>
                <h3 className="font-bold text-lg text-[#5a5a40] mb-1">{item.title}</h3>
                <p className="text-sm text-[#5a5a40]/70 line-clamp-2">{item.desc}</p>
                
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#5a5a40]/50 uppercase tracking-wider">
                  <span className="group-hover:text-[#d4a373] transition-colors">Bắt đầu học</span>
                  <PlayCircle className="w-4 h-4 group-hover:text-[#d4a373] transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Button 
            variant="outline" 
            onClick={() => setSelectedLevel(null)}
            className="mb-4"
          >
            ← Quay lại danh sách
          </Button>

          <Card className="border border-[#5a5a40]/20 bg-white/80 backdrop-blur">
            <CardContent className="p-6 md:p-8">
              <h2 className="font-serif text-2xl font-bold text-[#5a5a40] mb-6 flex items-center gap-3">
                <div className="bg-[#faedcd] p-2 rounded-xl text-[#d4a373]">
                   <Book className="w-6 h-6" />
                </div>
                Cấp độ: {selectedLevel}
              </h2>
              
              <div className="prose prose-stone prose-p:leading-relaxed prose-pre:bg-[#f5f5f0] prose-pre:text-[#2d2d2a] prose-h3:text-[#5a5a40] prose-h3:font-serif prose-h3:mt-8 prose-strong:text-[#5a5a40] max-w-none prose-table:min-w-full prose-th:bg-[#f5f5f0] prose-th:p-2 prose-td:p-2 prose-td:border-t prose-td:border-[#5a5a40]/10">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[#5a5a40]/50">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-sm font-medium animate-pulse">Aria đang soạn giáo án riêng cho bạn...</p>
                  </div>
                ) : (
                  <div className="markdown-body">
                    <ReactMarkdown>{lessonContent}</ReactMarkdown>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
