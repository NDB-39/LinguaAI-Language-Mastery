import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { chatWithAria, Message } from '@/src/services/aiService';
import { Loader2, Route, BookOpen, Clock, Target, Save, Send, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '@/src/store/useStore';
import { cn } from '@/src/lib/utils';

export function Path() {
  const { progress, setSavedRoadmap } = useStore();
  const [level, setLevel] = useState('Beginner');
  const [goal, setGoal] = useState('Giao tiếp du lịch');
  const [hours, setHours] = useState('1');
  
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [saved, setSaved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (messages.length > 2) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const generatePath = async () => {
    setLoading(true);
    setMessages([]);
    setSaved(false);
    try {
      const prompt = `Hãy tạo một lộ trình học tập cá nhân hóa.
      - Trình độ hiện tại: ${level}
      - Mục tiêu: ${goal}
      - Thời gian dành ra mỗi ngày: ${hours} giờ.
      Hãy viết dưới định dạng Markdown, chia làm các tuần (Tuần 1, Tuần 2,...). Giao diện tối ưu để đọc lướt. Viết bằng tiếng Việt.
      Sau khi đưa ra lộ trình, hãy đặt 1-2 câu hỏi ngắn để xem học sinh có muốn điều chỉnh thêm không.`;
      
      const newMessages: Message[] = [
        { role: 'system', content: "Bạn là chuyên gia giáo dục ngôn ngữ AI. Hãy thiết kế lộ trình học tập và thân thiện hỏi người dùng xem họ có muốn điều chỉnh gì không." },
        { role: 'user', content: prompt }
      ];
      
      const response = await chatWithAria(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error(err);
      setMessages([{ role: 'system', content: '' }, { role: 'user', content: 'Lỗi' }, { role: 'assistant', content: "Xin lỗi, không thể tạo lộ trình lúc này. Hãy thử lại." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || loadingChat) return;
    
    const userMsg: Message = { role: 'user', content: chatInput };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setChatInput('');
    setLoadingChat(true);
    setSaved(false); // require saving again if changed

    try {
      const response = await chatWithAria(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "Xin lỗi, mình gặp lỗi kết nối. Hãy thử lại sau nhé." }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const saveRoadmap = () => {
    // Luu toan bo tin nhan de co the doc context
    setSavedRoadmap(JSON.stringify(messages));
    setSaved(true);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-[#5a5a40] tracking-tight mb-2">Roadmap Planning</h1>
        <p className="text-[#5a5a40]/60">AI sẽ thiết kế riêng một lộ trình học phù hợp với khả năng và quỹ thời gian của bạn.</p>
      </header>

      {messages.length === 0 && !loading && (
        <Card className="max-w-xl mx-auto border-[#5a5a40]/10 shadow-sm">
          <CardContent className="p-8 space-y-6">
            {progress.savedRoadmap && (
              <div className="bg-[#faedcd]/50 border border-[#d4a373]/30 p-4 rounded-xl flex items-center justify-between mb-4 fade-in">
                <div className="flex flex-col">
                   <span className="text-sm font-bold text-[#5a5a40]">Bạn đã lưu một lộ trình</span>
                   <span className="text-xs text-[#5a5a40]/60">Bạn có thể xem lại hoặc tiếp tục điều chỉnh.</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setMessages(JSON.parse(progress.savedRoadmap!))}>Xem lộ trình</Button>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest font-bold text-[#5a5a40]/60 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#5a5a40]" /> THÔNG TIN TRÌNH ĐỘ
              </label>
              <select 
                className="w-full p-4 border border-[#5a5a40]/20 rounded-2xl focus:ring-2 focus:ring-[#5a5a40] focus:border-transparent bg-[#f5f5f0] text-[#2d2d2a] font-medium outline-none transition-all"
                value={level} 
                onChange={e => setLevel(e.target.value)}
              >
                <option>Mất gốc (Beginner)</option>
                <option>Cơ bản (Elementary)</option>
                <option>Trung cấp (Intermediate)</option>
                <option>Nâng cao (Advanced)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest font-bold text-[#5a5a40]/60 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#5a5a40]" /> MỤC TIÊU HỌC TẬP
              </label>
              <select 
                className="w-full p-4 border border-[#5a5a40]/20 rounded-2xl focus:ring-2 focus:ring-[#5a5a40] focus:border-transparent bg-[#f5f5f0] text-[#2d2d2a] font-medium outline-none transition-all"
                value={goal} 
                onChange={e => setGoal(e.target.value)}
              >
                <option>Giao tiếp du lịch</option>
                <option>Phỏng vấn xin việc</option>
                <option>Học thuật (IELTS/TOEIC)</option>
                <option>Đọc tài liệu chuyên ngành</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest font-bold text-[#5a5a40]/60 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5a5a40]" /> THỜI GIAN THEO ĐUỔI (GIỜ/NGÀY)
              </label>
              <input 
                type="number" 
                min="0.5" 
                step="0.5"
                className="w-full p-4 border border-[#5a5a40]/20 rounded-2xl focus:ring-2 focus:ring-[#5a5a40] focus:border-transparent bg-[#f5f5f0] text-[#2d2d2a] font-medium outline-none transition-all"
                value={hours} 
                onChange={e => setHours(e.target.value)}
              />
            </div>

            <Button className="w-full gap-2 mt-8 py-6 text-base shadow-md" size="lg" onClick={generatePath}>
               Tạo lộ trình chuẩn với AI <Route className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center h-64 space-y-6 text-[#5a5a40]">
          <Loader2 className="w-12 h-12 animate-spin text-[#d4a373]" />
          <p className="font-semibold text-sm uppercase tracking-widest animate-pulse">Đang suy nghĩ lộ trình...</p>
        </div>
      )}

      {messages.length > 0 && (
        <div className="space-y-6 fade-in max-w-3xl mx-auto">
           <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-[#5a5a40]/10 flex-wrap gap-4">
             <div>
               <h3 className="font-serif font-bold text-[#5a5a40] text-lg">Lộ trình của bạn</h3>
               <p className="text-xs text-[#5a5a40]/60">Trò chuyện với AI để sửa đổi nếu bạn muốn</p>
             </div>
             <Button onClick={saveRoadmap} disabled={saved} className={cn("gap-2 shadow-sm", saved ? "bg-green-600 hover:bg-green-600" : "bg-[#d4a373] hover:bg-[#c29161]")}>
               {saved ? <><CheckCircle2 className="w-4 h-4" /> Đã lưu</> : <><Save className="w-4 h-4" /> Lưu lộ trình</>}
             </Button>
           </div>

           <div className="space-y-4">
             {messages.filter(m => m.role !== 'system').map((msg, idx) => {
               if (idx === 0) return null; // skip the very first user config prompt
               return (
                 <Card key={idx} className={cn("border-[#5a5a40]/10 shadow-sm relative overflow-hidden", msg.role === 'user' ? "bg-[#f5f5f0] ml-12" : "bg-white mr-12")}>
                   {msg.role === 'assistant' && idx === 1 && <div className="absolute top-0 left-0 w-full h-2 bg-[#d4a373]" />}
                   <CardContent className="p-5 md:p-8 markdown-body prose prose-slate max-w-none text-[#2d2d2a] prose-h2:font-serif prose-h2:text-[#5a5a40]">
                     <ReactMarkdown>{msg.content}</ReactMarkdown>
                   </CardContent>
                 </Card>
               );
             })}
           </div>

           {loadingChat && (
             <div className="flex items-center gap-3 text-[#5a5a40]/60 p-4">
               <Loader2 className="w-5 h-5 animate-spin text-[#d4a373]" /> AI đang gửi phản hồi...
             </div>
           )}

           <div className="flex gap-2 items-center bg-white p-2 rounded-full border border-[#5a5a40]/20 shadow-sm mt-4">
             <input 
               value={chatInput} 
               onChange={(e) => setChatInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
               className="flex-1 p-3 bg-transparent outline-none ml-4 text-[#2d2d2a]"
               placeholder="Ví dụ: Thêm 30 phút luyện nghe podcast..."
             />
             <Button onClick={handleSendChat} disabled={!chatInput.trim() || loadingChat} className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-[#5a5a40]">
                <Send className="w-4 h-4" />
             </Button>
           </div>
           
           <div ref={bottomRef} className="h-4" />

           <div className="flex justify-center mt-8 pt-8 border-t border-[#5a5a40]/10">
              <Button variant="outline" onClick={() => setMessages([])}>Tạo lại yêu cầu ban đầu</Button>
           </div>
        </div>
      )}
    </div>
  );
}
