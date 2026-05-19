import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { askAI } from '@/src/services/aiService';
import { useStore } from '@/src/store/useStore';
import { Book, Loader2, PlayCircle, CheckCircle2, MessageSquare, Sparkles, Send, ArrowRight, ArrowLeft, Trophy, X } from 'lucide-react';
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

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

let imageQueue = Promise.resolve();

const QueuedImage = ({ src, alt, ...props }: any) => {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    
    const loadImg = async () => {
      imageQueue = imageQueue.then(async () => {
        if (!isMounted) return;
        
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => reject();
            img.src = src;
          });
          
          if (isMounted) {
            setLoadedSrc(src);
            setIsLoading(false);
          }
        } catch (err) {
           if (isMounted) {
             setLoadedSrc(src);
             setIsLoading(false);
           }
        }
        
        // Small delay between requests to avoid rate limits
        await new Promise(r => setTimeout(r, 800));
      });
    };
    
    if (src) {
      loadImg();
    }
    
    return () => { isMounted = false; };
  }, [src]);

  const matchWidth = src?.match(/width=(\d+)/);
  const matchHeight = src?.match(/height=(\d+)/);
  const width = matchWidth ? parseInt(matchWidth[1]) : null;
  const height = matchHeight ? parseInt(matchHeight[1]) : null;

  let isSquare = width === height && width !== null;
  
  let containerClass = "not-prose relative overflow-hidden rounded-2xl border border-[#5a5a40]/10 shadow-sm group my-8 bg-[#f5f5f0] flex items-center justify-center";

  if (isSquare) {
    containerClass = cn(containerClass, "aspect-square w-full sm:w-1/2 md:w-1/3 mx-auto");
  } else {
    containerClass = cn(containerClass, "aspect-video w-full");
  }

  return (
    <span className={cn(containerClass, "block max-w-full")}>
       {isLoading && (
         <span className="absolute inset-0 flex flex-col items-center justify-center text-[#5a5a40]/60 z-10 bg-gradient-to-b from-white/40 to-[#f5f5f0]/40">
           <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#d4a373]" />
           <span className="text-[10px] font-bold tracking-widest uppercase animate-pulse px-4 text-center max-w-[80%] truncate">
             {alt ? `AI ĐANG VẼ "${alt}"...` : 'AI ĐANG XUẤT ẢNH...'}
           </span>
         </span>
       )}
       {loadedSrc && (
         <img 
           src={loadedSrc} 
           alt={alt} 
           className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 animate-in fade-in duration-500"
           {...props} 
         />
       )}
    </span>
  );
};

export function Lessons() {
  const { progress, addXp } = useStore();
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  
  const [lessonHistory, setLessonHistory] = useState<string[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [followUpQuery, setFollowUpQuery] = useState('');

  // Quiz State
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const lessonContent = lessonHistory[currentLessonIndex] || '';

  const loadLesson = async (level: string) => {
    setSelectedLevel(level);
    setIsLoading(true);
    setLessonHistory([]);
    setCurrentLessonIndex(0);
    setIsQuizMode(false);

    const targetLang = progress.targetLanguage;
    const system = `Bạn là chuyên gia giáo viên ngoại ngữ. Nhiệm vụ của bạn là soạn một bài học tóm tắt cực kì sinh động và dễ hiểu cho cấp độ ${level} ngôn ngữ mã '${targetLang}'.
Bạn BẮT BUỘC CÓ MỘT ẢNH BÌA GIAO DIỆN (Hero Image) ở đầu bài học, và 2-3 CẬU TRÚC TỪ VỰNG HOẶC HỘI THOẠI CÓ ẢNH MINH HỌA.
Để chèn ảnh, bạn hãy sử dụng dịch vụ pollinations.ai. Cú pháp Markdown:
![Mô tả ảnh](https://image.pollinations.ai/prompt/Mã%20hoá%20URL%20các%20từ%20khóa%20tiếng%20Anh%20mô%20tả%20ảnh?width=800&height=400&nologo=true)
Ví dụ ảnh minh hoạ một lớp học: ![Classroom](https://image.pollinations.ai/prompt/students%20in%20a%20modern%20classroom%20illustration%20flat%20design?width=1200&height=675&nologo=true)
Ví dụ minh hoạ từ vựng quả táo: ![Apple](https://image.pollinations.ai/prompt/a%20red%20apple%20minimalist%20flat%20design?width=400&height=400&nologo=true)`;
    const prompt = `Hãy soạn bài học đầu tiên (Bài 1) về: 
1. 5 từ vựng/cụm từ thông dụng nhất ở cấp độ này kèm ví dụ. 
2. 1 điểm ngữ pháp trọng tâm và cách dùng. 
3. 2 đoạn hội thoại ngắn để ứng dụng.
Hãy format bằng Markdown đẹp đẽ, có emoji minh hoạ, bảng biểu nếu cần. Trả lời hoàn toàn bằng tiếng Việt. Bắt đầu bằng tiêu đề "## Bài 1: [Tên chủ đề]" kèm ảnh bìa bài học (tỷ lệ 16:9).`;
    
    try {
      const content = await askAI(system, prompt);
      setLessonHistory([content]);
    } catch (err) {
      setLessonHistory(['Lỗi khi tải bài học. Bạn thử lại nhé!']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextLesson = async () => {
    if (currentLessonIndex < lessonHistory.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      return;
    }

    setIsLoading(true);
    const targetLang = progress.targetLanguage;
    const currentLessonSummary = lessonHistory[currentLessonIndex].substring(0, 1500); // Context
    const nextLessonNum = currentLessonIndex + 2;
    
    const system = `Bạn là chuyên gia giáo viên ngoại ngữ. Học sinh đang học cấp độ ${selectedLevel} ngôn ngữ mã '${targetLang}'.
Bạn BẮT BUỘC CÓ MỘT ẢNH BÌA (Hero Image) ở đầu bài học, và vài ẢNH CỤ THỂ MINH HỌA TỪ VỰNG HOẶC TÌNH HUỐNG HỘI THOẠI.
Để chèn ảnh, bạn hãy sử dụng dịch vụ pollinations.ai. Cú pháp Markdown:
![Mô tả ảnh](https://image.pollinations.ai/prompt/Mã%20hoá%20URL%20các%20từ%20khóa%20tiếng%20Anh%20mô%20tả%20ảnh?width=800&height=400&nologo=true)`;
    const prompt = `Đây là tóm tắt một phần nội dung bài học trước (Bài ${nextLessonNum - 1}):
---
${currentLessonSummary}
---

Nhiệm vụ của bạn: Hãy thiết kế BÀI HỌC TIẾP THEO (Bài ${nextLessonNum}) cho học sinh này. 
Nội dung bài mới phải nối tiếp logic, KHÔNG được trùng lặp với bài trước, và nâng cao hơn một chút.
Yêu cầu bài mới:
1. 5 từ vựng/cụm từ mới kèm ví dụ.
2. 1 điểm ngữ pháp mới liên quan hoặc nâng cao hơn từ bài trước.
3. 2 đoạn hội thoại ứng dụng mới.
Hãy format bằng Markdown đẹp, có emoji minh hoạ, bảng biểu nếu cần. Có dùng ảnh minh họa từ vựng/tình huống. Trả lời hoàn toàn bằng tiếng Việt. Bắt đầu bằng tiêu đề "## Bài ${nextLessonNum}: [Tên chủ đề]"`;

    try {
      const content = await askAI(system, prompt);
      setLessonHistory(prev => [...prev, content]);
      setCurrentLessonIndex(nextLessonNum - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setLessonHistory(prev => {
        const newHistory = [...prev];
        newHistory[currentLessonIndex] = prev[currentLessonIndex] + '\n\n*Lỗi khi AI nội suy bài mới. Bạn hãy thử lại nhé!*';
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExpandLesson = async (query: string) => {
    if (!query.trim() || isExpanding) return;
    
    setIsExpanding(true);
    const targetLang = progress.targetLanguage;
    const system = `Bạn là giáo viên chuyên gia ngôn ngữ mã '${targetLang}'. Học sinh đang học cấp độ ${selectedLevel}.
Hãy phản hồi câu hỏi hoặc yêu cầu sau của học sinh một cách chi tiết, có ví dụ minh hoạ và giữ thái độ khích lệ. Format bằng Markdown gọn gàng.`;
    
    try {
      const additionalContent = await askAI(system, query);
      setLessonHistory(prev => {
        const newHistory = [...prev];
        newHistory[currentLessonIndex] = prev[currentLessonIndex] + `\n\n---\n\n### 💡 Khám phá thêm (${query}):\n\n` + additionalContent;
        return newHistory;
      });
      setFollowUpQuery('');
    } catch (err) {
      setLessonHistory(prev => {
        const newHistory = [...prev];
        newHistory[currentLessonIndex] = prev[currentLessonIndex] + '\n\n*Aria gặp chút sự cố khi nội suy đoạn này. Bạn thử lại nhé!*';
        return newHistory;
      });
    } finally {
      setIsExpanding(false);
    }
  };

  const startQuiz = async () => {
    setIsQuizMode(true);
    setIsQuizLoading(true);
    setQuizFinished(false);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setSelectedOption(null);
    setShowExplanation(false);

    const targetLang = progress.targetLanguage;
    const system = `Bạn là hệ thống tạo bài tập ngoại ngữ. Ngôn ngữ mục tiêu: '${targetLang}'. Cấp độ: ${selectedLevel}.`;
    let contextLesson = lessonContent.substring(0, 1500) || "";
    const prompt = `Dựa vào bài học sau:
${contextLesson}

Hãy tạo TỐI THIỂU 3 và TỐI ĐA 5 câu trắc nghiệm dựa trên nội dung trên.
TRẢ VỀ DUY NHẤT một mảng JSON (BẮT BUỘC ĐÚNG CÚ PHÁP ĐỂ CHẠY JSON.parse).
[
  {
    "question": "Câu hỏi tiếng Việt hoặc ngoại ngữ",
    "options": ["Đáp án 1", "Đáp án 2", "Đáp án 3", "Đáp án 4"],
    "correctIndex": 0,
    "explanation": "Giải thích ngắn"
  }
]`;

    try {
      const resp = await askAI(system, prompt);
      let jsonString = resp;
      const match = resp.match(/\[[\s\S]*\]/);
      if (match) {
        jsonString = match[0];
      }
      const questions: QuizQuestion[] = JSON.parse(jsonString);
      if (Array.isArray(questions) && questions.length > 0) {
         setQuizQuestions(questions);
      } else {
         throw new Error("Invalid format");
      }
    } catch (err) {
      console.error("Quiz generation failed:", err);
      setIsQuizMode(false);
      handleExpandLesson("Tạo cho tôi bài tập dạng chữ do hệ thống trắc nghiệm vừa gặp lỗi");
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
    
    if (index === quizQuestions[currentQuizIndex].correctIndex) {
      setQuizScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(c => c + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      if (quizScore + (selectedOption === quizQuestions[currentQuizIndex].correctIndex ? 1 : 0) > 0) {
        const earnedXp = (quizScore + (selectedOption === quizQuestions[currentQuizIndex].correctIndex ? 1 : 0)) * 10;
        addXp(earnedXp);
      }
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
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
          </Button>

          {isQuizMode ? (
            <Card className="border border-[#5a5a40]/20 bg-white/80 backdrop-blur">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#5a5a40]/10">
                  <h2 className="font-serif text-2xl font-bold text-[#5a5a40] flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-yellow-500" /> Ôn tập thông minh
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setIsQuizMode(false)}>
                    <X className="w-4 h-4" /> Đóng
                  </Button>
                </div>

                {isQuizLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[#5a5a40]/50">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-sm font-medium animate-pulse">Aria đang suy nghĩ và ra đề bài...</p>
                  </div>
                ) : quizFinished ? (
                   <div className="text-center py-10 animate-in zoom-in duration-500">
                     <div className="inline-flex items-center justify-center w-20 h-20 bg-[#faedcd] rounded-full mb-6">
                       <Trophy className="w-10 h-10 text-yellow-600" />
                     </div>
                     <h3 className="text-2xl font-bold text-[#5a5a40] mb-2">Hoàn thành bài tập!</h3>
                     <p className="text-lg text-[#5a5a40]/80 mb-6">
                       Bạn trả lời đúng <strong>{quizScore}/{quizQuestions.length}</strong> câu hỏi.
                     </p>
                     
                     <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl inline-block mb-8 border border-yellow-200">
                       <p className="font-bold cursor-default">✨ +{quizScore * 10} XP</p>
                     </div>
                     
                     <div className="flex justify-center gap-4">
                       <Button onClick={() => startQuiz()} variant="outline">Làm lại bài khác</Button>
                       <Button onClick={() => setIsQuizMode(false)} className="bg-[#5a5a40] text-white">Quay lại bài học</Button>
                     </div>
                   </div>
                ) : quizQuestions.length > 0 ? (
                  <div className="max-w-2xl mx-auto py-6 animate-in fade-in slide-in-from-right-4 duration-500" key={currentQuizIndex}>
                    <div className="flex items-center gap-2 mb-8">
                       {quizQuestions.map((_, idx) => (
                         <div key={idx} className={cn("h-2 flex-1 rounded-full", idx === currentQuizIndex ? "bg-[#d4a373]" : idx < currentQuizIndex ? "bg-[#5a5a40]" : "bg-gray-200")} />
                       ))}
                    </div>

                    <h3 className="text-xl font-bold text-[#2d2d2a] mb-8 leading-relaxed">
                      {quizQuestions[currentQuizIndex].question}
                    </h3>
                    
                    <div className="space-y-3 mb-8">
                      {quizQuestions[currentQuizIndex].options.map((option, idx) => {
                        const isCorrect = idx === quizQuestions[currentQuizIndex].correctIndex;
                        const isSelected = selectedOption === idx;
                        
                        let btnClass = "w-full justify-start h-auto py-4 px-6 text-left whitespace-normal border-[#5a5a40]/20 hover:border-[#d4a373] text-[#5a5a40]";
                        
                        if (showExplanation) {
                          if (isCorrect) {
                            btnClass = "w-full justify-start h-auto py-4 px-6 text-left whitespace-normal bg-green-50 border-green-500 text-green-700";
                          } else if (isSelected) {
                            btnClass = "w-full justify-start h-auto py-4 px-6 text-left whitespace-normal bg-red-50 border-red-500 text-red-700";
                          } else {
                            btnClass = "w-full justify-start h-auto py-4 px-6 text-left whitespace-normal opacity-50";
                          }
                        }
                        
                        return (
                          <Button 
                            key={idx}
                            variant="outline"
                            className={btnClass}
                            onClick={() => handleSelectOption(idx)}
                            disabled={showExplanation}
                          >
                            <span className="mr-3 font-bold opacity-50">{String.fromCharCode(65 + idx)}.</span>
                            <span>{option}</span>
                          </Button>
                        );
                      })}
                    </div>

                    {showExplanation && (
                      <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-[#f5f5f0] rounded-xl border border-[#5a5a40]/10 mb-8">
                        <p className="font-bold text-[#5a5a40] mb-1">
                          {selectedOption === quizQuestions[currentQuizIndex].correctIndex ? '✅ Chính xác!' : '❌ Chưa chính xác'}
                        </p>
                        <p className="text-sm text-[#5a5a40]/80">{quizQuestions[currentQuizIndex].explanation}</p>
                      </div>
                    )}

                    {showExplanation && (
                      <div className="flex justify-end">
                        <Button onClick={handleNextQuestion} className="bg-[#d4a373] hover:bg-[#b0875c] text-white">
                          {currentQuizIndex < quizQuestions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : (
          <Card className="border border-[#5a5a40]/20 bg-white/80 backdrop-blur">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-[#5a5a40]/10 pb-6">
                <h2 className="font-serif text-2xl font-bold text-[#5a5a40] flex items-center gap-3">
                  <div className="bg-[#faedcd] p-2 rounded-xl text-[#d4a373]">
                     <Book className="w-6 h-6" />
                  </div>
                  Cấp độ: {selectedLevel}
                </h2>
                
                {lessonHistory.length > 0 && !isLoading && (
                  <div className="flex items-center gap-3 text-sm font-bold text-[#5a5a40] bg-[#f5f5f0] px-4 py-2 rounded-full border border-[#5a5a40]/10">
                    <button 
                      onClick={handlePrevLesson}
                      disabled={currentLessonIndex === 0}
                      className="disabled:opacity-30 hover:text-[#d4a373] transition-colors p-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span>Bài {currentLessonIndex + 1} / {lessonHistory.length}</span>
                    <button 
                      onClick={handleNextLesson}
                      className="hover:text-[#d4a373] transition-colors p-1"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="prose prose-stone prose-p:leading-relaxed prose-pre:bg-[#f5f5f0] prose-pre:text-[#2d2d2a] prose-h2:text-[#5a5a40] prose-h2:font-serif prose-h3:text-[#5a5a40] prose-h3:font-serif prose-h3:mt-8 prose-strong:text-[#5a5a40] max-w-none prose-table:min-w-full prose-th:bg-[#f5f5f0] prose-th:p-2 prose-td:p-2 prose-td:border-t prose-td:border-[#5a5a40]/10">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-[#5a5a40] w-full bg-gradient-to-b from-white/80 to-[#f5f5f0]/80 rounded-3xl border border-[#5a5a40]/10 shadow-inner">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-[#d4a373] opacity-30 rounded-full animate-pulse blur-2xl"></div>
                      <div className="relative bg-white w-16 h-16 rounded-2xl shadow-sm border border-[#5a5a40]/10 flex items-center justify-center animate-bounce">
                        <Sparkles className="w-8 h-8 text-[#d4a373]" />
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-[#5a5a40] mb-3 text-center">
                      {lessonHistory.length === 0 ? "Aria đang soạn giáo án..." : "Aria đang thiết kế bài học mới..."}
                    </h3>
                    <p className="text-sm text-[#5a5a40]/60 mb-8 max-w-sm text-center">
                      Quá trình này sử dụng AI để tạo nội dung cá nhân hóa, bạn đợi một lát nhé.
                    </p>
                    <div className="flex flex-col gap-3 w-full max-w-xs opacity-80">
                      <div className="h-3 w-full bg-[#5a5a40]/10 rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 bg-[#d4a373]/50 w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                      </div>
                      <div className="h-3 w-4/5 mx-auto bg-[#5a5a40]/10 rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 bg-[#d4a373]/40 w-full animate-[pulse_1.5s_ease-in-out_0.2s_infinite]"></div>
                      </div>
                      <div className="h-3 w-3/5 mx-auto bg-[#5a5a40]/10 rounded-full overflow-hidden relative">
                         <div className="absolute inset-y-0 left-0 bg-[#d4a373]/30 w-full animate-[pulse_1.5s_ease-in-out_0.4s_infinite]"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="markdown-body">
                      <ReactMarkdown 
                        components={{
                          img: ({node, ...props}) => (
                            <QueuedImage {...props} />
                          )
                        }}
                      >
                        {lessonContent}
                      </ReactMarkdown>
                    </div>

                    <div className="bg-[#f5f5f0] p-6 rounded-2xl border border-[#5a5a40]/10 mt-8">
                      <h4 className="font-bold text-[#5a5a40] mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#d4a373]" />
                        Đào sâu bài học này
                      </h4>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleExpandLesson("Cho thêm 5 ví dụ khác về điểm ngữ pháp này")}
                          disabled={isExpanding}
                          className="bg-white"
                        >
                          Thêm ví dụ ngữ pháp
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={startQuiz}
                          disabled={isExpanding}
                          className="bg-white hover:text-yellow-600 hover:border-yellow-600"
                        >
                          <Trophy className="w-4 h-4 mr-2" /> Làm bài tập nhỏ
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleExpandLesson("Bài học này ứng dụng trong tình huống công sở thế nào?")}
                          disabled={isExpanding}
                          className="bg-white"
                        >
                          Ứng dụng thực tế
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={followUpQuery}
                          onChange={(e) => setFollowUpQuery(e.target.value)}
                          placeholder="Bạn muốn Aria giải thích thêm điều gì?"
                          className="flex-1 px-4 py-2 rounded-xl border border-[#5a5a40]/20 focus:outline-none focus:ring-2 focus:ring-[#d4a373] bg-white transition-all text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleExpandLesson(followUpQuery)}
                          disabled={isExpanding}
                        />
                        <Button 
                          onClick={() => handleExpandLesson(followUpQuery)} 
                          disabled={!followUpQuery.trim() || isExpanding}
                          className="bg-[#5a5a40] text-white hover:bg-[#4a4a35]"
                        >
                          {isExpanding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-[#5a5a40]/10 mt-8">
                      <Button 
                        onClick={handleNextLesson}
                        className="bg-[#5a5a40] text-white hover:bg-[#4a4a35] shadow-md flex items-center gap-2 flex-1 sm:flex-none justify-center"
                        size="lg"
                        disabled={isLoading}
                      >
                        {currentLessonIndex < lessonHistory.length - 1 ? (
                          <>Bài lên tiếp theo <ArrowRight className="w-5 h-5 ml-1" /></>
                        ) : (
                          <><Sparkles className="w-5 h-5" /> AI Tạo bài tiếp theo</>
                        )}
                      </Button>

                      <Button 
                        onClick={() => navigate('/teacher')}
                        className="bg-[#d4a373] text-white hover:bg-[#b0875c] shadow-md shadow-[#d4a373]/20 flex items-center gap-2 flex-1 sm:flex-none justify-center"
                        size="lg"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Thực hành với Aria
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      )}
    </div>
  );
}
