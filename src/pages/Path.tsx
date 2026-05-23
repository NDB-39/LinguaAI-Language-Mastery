import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { chatWithAria, Message } from '@/src/services/aiService';
import { Loader2, Route, BookOpen, Clock, Target, Save, Send, CheckCircle2, MessageSquare, Book, Download, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '@/src/store/useStore';
import { cn } from '@/src/lib/utils';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "mt-4 transition-colors p-2 rounded-xl flex items-center gap-1.5 font-medium border border-[#5a5a40]/10",
        copied ? "text-green-600 bg-green-50 border-green-200" : "text-[#5a5a40]/60 hover:text-[#5a5a40] hover:bg-[#f5f5f0]"
      )}
      title="Sao chép"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      <span className="text-xs">{copied ? "Đã chép" : "Copy nội dung"}</span>
    </button>
  );
}

export function Path() {
  const { progress, setSavedRoadmap } = useStore();
  const navigate = useNavigate();
  
  // Auto-infer initial level based on XP/level in store
  const getInitialLevelStr = (lvl: number) => {
    if (lvl < 5) return 'Mất gốc (Beginner)';
    if (lvl < 15) return 'Cơ bản (Elementary)';
    if (lvl < 30) return 'Trung cấp (Intermediate)';
    return 'Nâng cao (Advanced)';
  };

  const [level, setLevel] = useState(getInitialLevelStr(progress.level));
  const [goal, setGoal] = useState('Giao tiếp du lịch');
  const [hours, setHours] = useState('1');
  
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [saved, setSaved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sync when global level changes
  useEffect(() => {
    setLevel(getInitialLevelStr(progress.level));
  }, [progress.level]);

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
      - Ngôn ngữ mục tiêu: ${progress.targetLanguage} (Cấp độ hiện tại trên app: Level ${progress.level})
      - Đánh giá khả năng: ${level}
      - Mục tiêu: ${goal}
      - Thời gian dành ra mỗi ngày: ${hours} giờ.
      Hãy viết dưới định dạng Markdown, chia làm các tuần (Tuần 1, Tuần 2,...). Tổ chức giao diện tối ưu để đọc lướt. 
      Vui lòng đưa ra các gợi ý cụ thể để học viên kết hợp dùng chức năng "Bài học" (để học nền tảng) và "Trợ lý/Giáo viên" (để thực hành giao tiếp) trong ứng dụng này.
      Viết bằng tiếng Việt. Sau khi đưa ra lộ trình, hãy đặt 1-2 câu hỏi ngắn để xem học sinh có muốn điều chỉnh thêm không.`;
      
      const newMessages: Message[] = [
        { role: 'system', content: "Bạn là chuyên gia giáo dục ngôn ngữ AI. Hãy thiết kế lộ trình học tập, liên kết chặt chẽ với các tính năng của app (Bài học, Giáo viên AI) và thân thiện hỏi người dùng xem họ có muốn điều chỉnh gì không." },
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
    setSaved(false);

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
    setSavedRoadmap(JSON.stringify(messages));
    setSaved(true);
  };

  const downloadRoadmap = () => {
    const roadmapContent = messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join('\n\n---\n\n');

    const blob = new Blob([roadmapContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roadmap_${progress.targetLanguage}_level${progress.level}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasGeneratedRoadmap = messages.length > 0;

  return (
    <div className="space-y-8 pb-12">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#5a5a40] tracking-tight mb-2">Lộ trình học tập</h1>
            <p className="text-[#5a5a40]/60">AI thiết kế lộ trình riêng dựa trên khả năng, mục tiêu và <span className="font-bold text-[#d4a373]">Level {progress.level}</span> hiện tại của bạn.</p>
          </div>
        </div>
      </header>

      {!hasGeneratedRoadmap && !loading && (
        <Card className="max-w-xl mx-auto border-[#5a5a40]/10 shadow-sm">
          <CardContent className="p-8 space-y-6">
            {progress.savedRoadmap && (
              <div className="bg-[#faedcd]/50 border border-[#d4a373]/30 p-4 rounded-xl flex items-center justify-between mb-4 fade-in">
                <div className="flex flex-col">
                   <span className="text-sm font-bold text-[#5a5a40]">Bạn đã lưu một lộ trình</span>
                   <span className="text-xs text-[#5a5a40]/60">Sử dụng lại lộ trình cũ hoặc tạo mới.</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setMessages(JSON.parse(progress.savedRoadmap!))}>Xem lộ trình</Button>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest font-bold text-[#5a5a40]/60 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#5a5a40]" /> TRÌNH ĐỘ HIỆN TẠI
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
                <Target className="w-4 h-4 text-[#5a5a40]" /> MỤC TIÊU HỌC TẬP {progress.targetLanguage.toUpperCase()}
              </label>
              <select 
                className="w-full p-4 border border-[#5a5a40]/20 rounded-2xl focus:ring-2 focus:ring-[#5a5a40] focus:border-transparent bg-[#f5f5f0] text-[#2d2d2a] font-medium outline-none transition-all"
                value={goal} 
                onChange={e => setGoal(e.target.value)}
              >
                <option>Giao tiếp du lịch</option>
                <option>Phỏng vấn xin việc</option>
                <option>Học thuật (IELTS/TOEIC/JLPT...)</option>
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

            <Button className="w-full gap-2 mt-8 py-6 text-base shadow-md bg-[#5a5a40] hover:bg-[#4a4a35] text-white" size="lg" onClick={generatePath}>
               Đồng bộ & Tạo lộ trình AI <Route className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center h-64 space-y-6 text-[#5a5a40]">
          <Loader2 className="w-12 h-12 animate-spin text-[#d4a373]" />
          <p className="font-semibold text-sm uppercase tracking-widest animate-pulse">Aria đang liên kết dữ liệu ứng dụng & tạo lộ trình...</p>
        </div>
      )}

      {hasGeneratedRoadmap && (
        <div className="space-y-6 fade-in max-w-3xl mx-auto">
           <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-[#5a5a40]/10 flex-wrap gap-4 sticky top-4 z-10">
             <div>
               <h3 className="font-serif font-bold text-[#5a5a40] text-lg">Lộ trình của bạn</h3>
               <p className="text-xs text-[#5a5a40]/60">Đã đồng bộ với cấp độ {progress.level} ({progress.targetLanguage.toUpperCase()})</p>
             </div>
             <div className="flex gap-2">
               <Button onClick={downloadRoadmap} variant="outline" size="sm" title="Tải xuống (.md)">
                 <Download className="w-4 h-4" />
               </Button>
               <Button onClick={() => setMessages([])} variant="outline" size="sm">Tạo lại</Button>
               <Button onClick={saveRoadmap} disabled={saved} size="sm" className={cn("gap-2 shadow-sm", saved ? "bg-green-600 hover:bg-green-600 outline-none text-white border-transparent" : "bg-[#d4a373] hover:bg-[#c29161] text-white outline-none border-transparent")}>
                 {saved ? <><CheckCircle2 className="w-4 h-4" /> Đã lưu</> : <><Save className="w-4 h-4" /> Cập nhật lưu trữ</>}
               </Button>
             </div>
           </div>

           <div className="space-y-4">
             {messages.filter(m => m.role !== 'system').map((msg, idx) => {
               if (idx === 0) return null; // skip the very first user config prompt
               return (
                 <Card key={idx} className={cn("border-[#5a5a40]/10 shadow-sm relative overflow-hidden", msg.role === 'user' ? "bg-[#f5f5f0] ml-12" : "bg-white mr-12")}>
                   {msg.role === 'assistant' && idx === 1 && <div className="absolute top-0 left-0 w-full h-2 bg-[#d4a373]" />}
                   <CardContent className="p-5 md:p-8 markdown-body prose prose-slate max-w-none text-[#2d2d2a] prose-h2:font-serif prose-h2:text-[#5a5a40]">
                     <ReactMarkdown>{msg.content}</ReactMarkdown>
                     
                     {msg.role === 'assistant' && (
                        <div className="flex justify-end border-t border-[#5a5a40]/10 mt-6 pt-2 not-prose">
                          <CopyButton text={msg.content} />
                        </div>
                     )}

                     {/* Suggest actions based on AI roadmap content, usually appended at the end of the AI's first deep response */}
                     {msg.role === 'assistant' && idx === 1 && (
                        <div className="mt-8 p-4 bg-[#f5f5f0] border border-[#5a5a40]/10 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between not-prose">
                          <div>
                            <h4 className="font-bold text-[#5a5a40] flex items-center gap-2 mb-1">
                               ⚡ Thiết lập đã hoàn tất
                            </h4>
                            <p className="text-sm text-[#5a5a40]/70">Lộ trình của bạn đã được kết nối. Hãy bắt đầu hành động ngay!</p>
                          </div>
                          <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <Button 
                              onClick={() => navigate('/lessons')}
                              variant="outline"
                              className="bg-white hover:border-[#d4a373] hover:text-[#d4a373] flex-1 md:flex-none"
                            >
                              <Book className="w-4 h-4 mr-2" /> Học Bài mới
                            </Button>
                            <Button 
                              onClick={() => navigate('/teacher')}
                              className="bg-[#5a5a40] hover:bg-[#4a4a35] text-white flex-1 md:flex-none"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" /> Thực hành ngay
                            </Button>
                          </div>
                        </div>
                     )}
                   </CardContent>
                 </Card>
               );
             })}
           </div>

           {loadingChat && (
             <div className="flex items-center gap-3 text-[#5a5a40]/60 p-4">
               <Loader2 className="w-5 h-5 animate-spin text-[#d4a373]" /> Đang điều chỉnh lộ trình...
             </div>
           )}

           <div className="flex gap-2 items-center bg-white p-2 rounded-full border border-[#5a5a40]/20 shadow-sm mt-4">
             <input 
               value={chatInput} 
               onChange={(e) => setChatInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
               className="flex-1 p-3 bg-transparent outline-none ml-4 text-[#2d2d2a]"
               placeholder="Gõ yêu cầu: Đổi lịch vào cuối tuần, tải trọng bài tập nhẹ hơn..."
             />
             <Button onClick={handleSendChat} disabled={!chatInput.trim() || loadingChat} className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-[#5a5a40] text-white">
                <Send className="w-4 h-4" />
             </Button>
           </div>
           
           <div ref={bottomRef} className="h-4" />
        </div>
      )}
    </div>
  );
}

