import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/src/components/ui/Button';
import { askTeacher, Message } from '@/src/services/aiService';
import { Send, GraduationCap, User, Loader2, PlayCircle, KeyRound, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/src/lib/utils';
import { useStore } from '@/src/store/useStore';
import { useNavigate } from 'react-router-dom';

export function Teacher() {
  const { progress, setTeacherHistory } = useStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(progress.teacherHistory || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // System instruction for Teacher
  const roadmapContext = progress.savedRoadmap 
    ? `\nHọc sinh này đang theo lộ trình học tập như sau:\n${progress.savedRoadmap.substring(0, 1000)}...\nHãy dựa vào lộ trình này để hướng dẫn, đưa ra lời khuyên sát thực tế hoặc kiểm tra nếu họ yêu cầu.`
    : "";

  const systemInstruction = `Bạn là Teacher AI, một giáo viên ngôn ngữ chuyên nghiệp chuyên sâu.
Ngôn ngữ giảng dạy dự kiến: ${progress.targetLanguage}
Cấp độ hiện tại của học sinh trên hệ thống: Cấp độ ${progress.level}${roadmapContext}
Bạn có khả năng:
- Giải thích ngữ pháp cặn kẽ
- Tạo bài tập trắc nghiệm / tự luận
- Kiểm tra đáp án cơ bản và chỉ ra lỗi sai
- Tạo flashcard để học sinh copy (có định dạng rõ ràng)
- Tạo các ví dụ câu giao tiếp theo chuẩn CEFR

Hãy sử dụng format Markdown tuyệt đẹp. Luôn giữ thái độ chuẩn mực, rõ ràng, giúp học sinh nắm vững kiến thức từ gốc rễ.`;

  useEffect(() => {
    if (messages.length === 0 && progress.geminiApiKey) {
      setMessages([
        { role: 'assistant', content: 'Chào em! Thầy/Cô là Giáo viên AI. Em muốn học ngữ pháp, làm bài tập hay kiểm tra từ vựng hôm nay?' }
      ]);
    }
  }, [progress.geminiApiKey, messages.length]);

  useEffect(() => {
    setTeacherHistory(messages);
  }, [messages, setTeacherHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const responseContent = await askTeacher(systemInstruction, newMessages, progress.geminiApiKey);
      setMessages([...newMessages, { role: 'assistant', content: responseContent }]);
    } catch (err: any) {
       setMessages([...newMessages, { role: 'assistant', content: `**Lỗi:** ${err.message || 'Không thể kết nối với Gemini API'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!progress.geminiApiKey) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-6 max-w-md mx-auto text-center mt-12 bg-white rounded-[32px] border border-[#5a5a40]/10 shadow-sm">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-400">
          <KeyRound className="w-10 h-10" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#5a5a40] mb-2">Chưa kết nối API Key</h2>
          <p className="text-[#5a5a40]/70 text-[15px]">
            Giáo viên AI sử dụng công nghệ Gemini nội suy cao cấp. Bạn cần nhập API Key cá nhân để mở khóa tính năng này.
          </p>
        </div>
        <Button onClick={() => navigate('/profile')} className="w-full h-14 rounded-full text-lg">
          Tới trang Hồ sơ để thiết lập
        </Button>
      </div>
    );
  }

  const suggestions = [
    "Giải thích giúp tôi thì Hiện tại hoàn thành",
    "Tạo 5 câu trắc nghiệm trình độ A2",
    "Tôi viết câu này sai chỗ nào: 'I goes to schools'",
    "Đưa ra 5 ví dụ từ vựng chủ đề sân bay chuẩn B1"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] w-full max-w-4xl mx-auto -m-8 md:-m-0 sm:m-0">
      <header className="px-6 py-4 bg-[#5a5a40] text-white flex items-center gap-3 shrink-0 rounded-t-3xl md:rounded-2xl md:mb-4">
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
           <GraduationCap className="w-5 h-5 text-[#faedcd]" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-bold leading-tight flex items-center gap-2">
            Giáo viên AI <span className="bg-[#faedcd] text-[#5a5a40] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Gemini</span>
          </h2>
          <p className="text-[11px] font-medium text-white/70">Nội suy văn bản & Giải đáp chuyên sâu</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#fcfaf7] md:rounded-2xl border-x md:border border-[#5a5a40]/5">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex items-end gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
             {msg.role === 'assistant' && (
               <div className="w-8 h-8 rounded-full bg-[#5a5a40] flex items-center justify-center shrink-0 mb-1">
                 <GraduationCap className="w-4 h-4 text-white" />
               </div>
             )}
             
             <div className={cn(
               "max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 prose prose-slate text-[15px] markdown-body",
               msg.role === 'user' 
                 ? "bg-[#5a5a40] text-white rounded-br-none prose-p:text-white prose-headings:text-white prose-strong:text-white" 
                 : "bg-white border border-[#5a5a40]/10 shadow-sm rounded-bl-none text-[#2d2d2a]"
             )}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
             </div>

             {msg.role === 'user' && (
               <div className="w-8 h-8 rounded-full bg-[#faedcd] border border-[#d4a373]/20 flex items-center justify-center shrink-0 mb-1">
                 <User className="w-4 h-4 text-[#d4a373]" />
               </div>
             )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
             <div className="w-8 h-8 rounded-full bg-[#5a5a40] flex items-center justify-center shrink-0 mb-1">
               <GraduationCap className="w-4 h-4 text-white" />
             </div>
             <div className="bg-white border border-[#5a5a40]/10 shadow-sm rounded-2xl rounded-bl-none px-5 py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#d4a373]" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-[#5a5a40]/10 md:rounded-b-2xl shrink-0 border-x">
         {/* Suggestions block */}
         {messages.length <= 1 && (
           <div className="hidden md:flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
              {suggestions.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(s)}
                  className="shrink-0 bg-[#f5f5f0] text-[#5a5a40] text-xs font-medium px-4 py-2 rounded-full border border-[#5a5a40]/10 hover:bg-[#5a5a40] hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
           </div>
         )}
         
         <div className="flex items-center gap-2 relative">
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi giáo viên (ngữ pháp, bài tập...)"
              className="flex-1 bg-[#f5f5f0] border border-[#5a5a40]/20 rounded-full pl-6 pr-14 py-3 lg:py-4 focus:outline-none focus:ring-2 focus:ring-[#5a5a40] transition-shadow text-[#2d2d2a]"
              disabled={isLoading}
            />
            <Button 
               size="sm" 
               className="absolute right-2 top-1.5 bottom-1.5 rounded-full w-10 md:w-12 h-auto px-0 bg-[#5a5a40] hover:bg-[#4a4a35]"
               onClick={handleSend}
               disabled={isLoading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
         </div>
      </div>
    </div>
  );
}
