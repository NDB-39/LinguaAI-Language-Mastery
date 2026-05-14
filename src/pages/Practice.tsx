import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Dialog } from '@/src/components/ui/Dialog';
import { askAI } from '@/src/services/aiService';
import { Mic, Square, Loader2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '@/src/store/useStore';

const EXERCISES = [
  "Hello, how are you doing today?",
  "I would like to order a cup of coffee.",
  "The weather is absolutely beautiful.",
  "Could you please tell me the way to the station?"
];

export function Practice() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const { addXp } = useStore();

  const currentExercise = EXERCISES[currentIdx];

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // assuming target language is English for now

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      // Wait a bit, then ask for confirmation
      setTimeout(() => setShowConfirm(true), 500);
    } else {
      setTranscript('');
      setFeedback(null);
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Speech recognition error:", err);
      }
    }
  };

  const analyzeAudio = async () => {
    setShowConfirm(false);
    if (!transcript) return;
    
    setIsLoading(true);
    try {
      const systemPrompt = `You are a strict but encouraging English pronunciation coach for a non-native speaker. 
      The user was supposed to read: "${currentExercise}".
      They actually said (according to STT): "${transcript}".
      Analyze the differences. Identify mispronounced words based on the STT output. 
      Provide feedback in Vietnamese, formatted beautifully in Markdown. Be concise. Give XP points (10-50).`;
      
      const response = await askAI(systemPrompt, `Analyze my pronunciation. I tried to say: ${currentExercise}. STT heard: ${transcript}`);
      setFeedback(response);
      addXp(20); // Add 20 XP for practicing
    } catch (err) {
      setFeedback("Xin lỗi, có lỗi xảy ra khi phân tích giọng nói. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextExercise = () => {
    setTranscript('');
    setFeedback(null);
    setCurrentIdx((prev) => (prev + 1) % EXERCISES.length);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-bold text-[#5a5a40]/60 uppercase tracking-widest">AI Analyzer Active</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#5a5a40] tracking-tight">Phòng luyện Phát âm</h1>
        <p className="text-[#5a5a40]/60 mt-2">Đọc to câu dưới đây. AI sẽ phân tích giọng nói của bạn.</p>
      </header>

      <div className="text-center py-10 relative">
        <p className="text-[#5a5a40]/40 text-sm font-bold uppercase tracking-wider mb-4">Practice this phrase:</p>
        <h2 className="font-serif text-5xl font-bold text-[#2d2d2a] leading-tight mb-4 tracking-tight">
          "{currentExercise}"
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6 pt-4">
        {isLoading ? (
           <div className="flex flex-col items-center gap-4 text-[#5a5a40]">
             <Loader2 className="w-12 h-12 animate-spin text-[#d4a373]" />
             <p className="font-medium animate-pulse text-sm uppercase tracking-widest">AI Analyzer Processing...</p>
           </div>
        ) : (
          <>
            <button
              onClick={toggleRecording}
              className={`flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-xl border-4 ${
                isRecording 
                  ? 'bg-red-50 border-red-200 animate-pulse' 
                  : 'bg-[#faedcd] border-[#d4a373] hover:scale-105'
              }`}
            >
              {isRecording ? <div className="w-8 h-8 rounded-full bg-red-500" /> : <Mic className="w-10 h-10 text-[#d4a373]" />}
            </button>
            <p className="text-sm font-semibold text-[#5a5a40]/80 uppercase tracking-wider">
              {isRecording ? 'Recording... Tap to stop' : 'Tap to Record & Analyze'}
            </p>
          </>
        )}
      </div>

      {transcript && !isLoading && (
        <Card className="bg-white border-[#5a5a40]/10 mt-12 bg-opacity-80 backdrop-blur-sm">
          <CardContent className="pt-6">
             <p className="text-xs font-bold uppercase tracking-widest text-[#5a5a40]/40 mb-2">Hệ thống nghe được:</p>
             <p className="font-serif text-2xl italic text-[#5a5a40]">"{transcript}"</p>
          </CardContent>
        </Card>
      )}

      {feedback && (
        <Card className="bg-[#fcfaf7] border-l-4 border-[#5a5a40] mt-6">
           <CardContent className="pt-6">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-white border border-[#5a5a40]/10 rounded-xl flex items-center justify-center font-serif font-bold text-[#d4a373] text-lg">A</div>
               <p className="text-xs font-bold text-[#5a5a40]/60 uppercase tracking-widest">Aria AI Tutor</p>
             </div>
             <div className="prose prose-slate max-w-none text-[#2d2d2a]">
               <ReactMarkdown>{feedback}</ReactMarkdown>
             </div>
             <div className="mt-8 flex justify-end border-t border-[#5a5a40]/10 pt-4">
               <Button onClick={nextExercise} className="gap-2">
                 Thử câu tiếp theo <RefreshCw className="w-4 h-4" />
               </Button>
             </div>
           </CardContent>
        </Card>
      )}

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
         <div className="text-center space-y-6 py-4">
            <h3 className="font-serif text-2xl font-bold text-[#5a5a40]">Ghi âm hoàn tất</h3>
            <p className="text-[#5a5a40]/80">Hệ thống đã nhận diện được giọng nói của bạn. Bạn muốn gửi cho AI phân tích chứ?</p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>Hủy bỏ</Button>
              <Button onClick={analyzeAudio}>Phân tích Audio</Button>
            </div>
         </div>
      </Dialog>
    </div>
  );
}
