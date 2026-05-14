import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/src/components/ui/Button';
import { chatWithAria, Message, getPollinationsImageUrl } from '@/src/services/aiService';
import { Send, Bot, User, Loader2, Volume2, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { cn } from '@/src/lib/utils';
import { useStore } from '@/src/store/useStore';

export function Assistant() {
  const { progress } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: `Bạn là Aria, một trợ lý ảo AI chuyên gia giáo dục ngôn ngữ. 
      Bạn giúp học viên thiết kế lộ trình "đo ni đóng giày" dựa trên trình độ và mục tiêu của họ. 
      Học viên hiện đang học ngôn ngữ có mã '${progress.targetLanguage}'. Cấp độ hiện tại: ${progress.level}. 
      Hãy giao tiếp thân thiện, khuyến khích, dùng tiếng Việt. Hãy hỏi thông tin cần thiết nếu cần thiết lập lộ trình.
      
      QUAN TRỌNG: Bạn có khả năng tạo hình ảnh minh họa từ vựng, tình huống giao tiếp, và visual mnemonic (kỹ thuật ghi nhớ bằng hình ảnh).
      Để tạo ảnh minh họa, bạn HÃY trả về đánh dấu Markdown theo định dạng:
      ![Mô tả ảnh chi tiết bằng TIẾNG ANH, KHÔNG CÓ KHOẢNG TRẮNG HOẶC DÙNG %20](https://image.pollinations.ai/prompt/CHI_TIET_MO_TA_ANH_BANG_TIENG_ANH_THAY_KHOANG_TRANG_BANG_%20?width=800&height=400&nologo=true)
      
      Ví dụ: Nếu sinh viên muốn ảnh về quả táo, bạn trả về:
      ![An apple on a table](https://image.pollinations.ai/prompt/An%20apple%20on%20a%20table?width=800&height=400&nologo=true)
      Hãy chủ động tạo thẻ hình ảnh này khi giải thích từ vựng hoặc tạo tình huống ngữ cảnh nhé.`
    },
    { role: 'assistant', content: 'Chào bạn! Mình là Aria, trợ lý ngôn ngữ AI của bạn. Bạn muốn mình thiết kế lộ trình học tập, giải đáp ngữ pháp hay luyện tập giao tiếp hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleAudio = (text: string, lang: string, idx: number) => {
    if (!window.speechSynthesis) return;

    if (playingIdx === idx && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setPlayingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/!\[.*?\]\(.*?\)/g, "").replace(/[#*`_]/g, "");
    const ut = new SpeechSynthesisUtterance(cleanText);
    ut.lang = lang === 'en' ? 'en-US' : (lang === 'ja' ? 'ja-JP' : (lang === 'ko' ? 'ko-KR' : 'zh-CN'));
    
    ut.onstart = () => setPlayingIdx(idx);
    ut.onend = () => setPlayingIdx(null);
    ut.onerror = () => setPlayingIdx(null);

    window.speechSynthesis.speak(ut);
  };

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
      const responseContent = await chatWithAria(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: responseContent }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "Xin lỗi, mình đang gặp sự cố kết nối. Bạn thử lại sau nhé." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  // Lọc ra system message để không hiển thị trên UI
  const displayMessages = messages.filter(m => m.role !== 'system');

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] w-full max-w-4xl mx-auto -m-8 md:-m-0 sm:m-0">
      <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-[#5a5a40]/10 flex items-center gap-3 shrink-0 rounded-t-3xl md:rounded-2xl md:mb-4">
        <div className="w-10 h-10 bg-[#faedcd] border border-[#d4a373]/20 rounded-full flex items-center justify-center text-[#d4a373]">
           <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-bold text-[#5a5a40] leading-tight">Aria Tutor</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
            Trực tuyến
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#fcfaf7] md:rounded-2xl border-x md:border border-[#5a5a40]/5">
        {displayMessages.map((msg, idx) => (
          <div key={idx} className={cn("flex items-end gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
             {msg.role === 'assistant' && (
               <div className="w-8 h-8 rounded-full bg-[#faedcd] border border-[#d4a373]/20 flex items-center justify-center shrink-0 mb-1">
                 <Bot className="w-4 h-4 text-[#d4a373]" />
               </div>
             )}
             
             <div className={cn(
               "max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 prose prose-slate text-[15px]",
               msg.role === 'user' 
                 ? "bg-[#5a5a40] text-white rounded-br-none prose-p:text-white prose-headings:text-white prose-strong:text-white" 
                 : "bg-white border border-[#5a5a40]/10 shadow-sm rounded-bl-none text-[#2d2d2a]"
             )}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => toggleAudio(msg.content, progress.targetLanguage, idx)}
                    className={cn(
                      "mt-2 transition-colors p-1 rounded-full flex items-center gap-1",
                      playingIdx === idx ? "text-red-400 hover:text-red-500" : "text-[#5a5a40]/40 hover:text-[#d4a373]"
                    )}
                    title={playingIdx === idx ? "Dừng đọc" : "Nghe phản hồi"}
                  >
                    {playingIdx === idx ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span className="text-[10px] uppercase font-bold tracking-wider">{playingIdx === idx ? "Stop" : "Audio"}</span>
                  </button>
                )}
             </div>

             {msg.role === 'user' && (
               <div className="w-8 h-8 rounded-full bg-[#5a5a40] flex items-center justify-center shrink-0 mb-1">
                 <User className="w-4 h-4 text-white" />
               </div>
             )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
             <div className="w-8 h-8 rounded-full bg-[#faedcd] border border-[#d4a373]/20 flex items-center justify-center shrink-0 mb-1">
               <Bot className="w-4 h-4 text-[#d4a373]" />
             </div>
             <div className="bg-white border border-[#5a5a40]/10 shadow-sm rounded-2xl rounded-bl-none px-5 py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#d4a373]" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-[#5a5a40]/10 md:rounded-b-2xl shrink-0 border-x">
         <div className="flex items-center gap-2 relative">
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhắn tin cho Aria để tạo lộ trình..."
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
