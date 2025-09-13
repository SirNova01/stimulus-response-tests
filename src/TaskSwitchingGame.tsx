import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Circle, Square, Triangle, Hexagon, Heart, Star, Octagon } from 'lucide-react';

// Type definitions
type BoxPosition = 'top' | 'bottom';

interface Shape {
  name: string;
  component: React.ComponentType<{ 
    size?: number; 
    className?: string; 
    strokeWidth?: number; 
    fill?: string 
  }>;
  isRound: boolean;
}

interface GameProps {
  onBackToMenu: () => void;
}

const TaskSwitchingGame: React.FC<GameProps> = ({ onBackToMenu }) => {
  const [activeBox, setActiveBox] = useState<BoxPosition>('top');
  const [currentNumber, setCurrentNumber] = useState<number>(1);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [trialStartTime, setTrialStartTime] = useState<number | null>(null);
  const [totalTrials, setTotalTrials] = useState<number>(0);
  const [correctTrials, setCorrectTrials] = useState<number>(0);
  const [hasResponded, setHasResponded] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  const shapes: Shape[] = [
    { name: 'circle', component: Circle, isRound: true },
    { name: 'square', component: Square, isRound: false },
    { name: 'triangle', component: Triangle, isRound: false },
    { name: 'hexagon', component: Hexagon, isRound: false },
    { name: 'heart', component: Heart, isRound: true },
    { name: 'star', component: Star, isRound: false },
    { name: 'octagon', component: Octagon, isRound: true }
  ];

  const generateNewTrial = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    
    const newBox: BoxPosition = Math.random() < 0.5 ? 'top' : 'bottom';
    const newNumber: number = Math.floor(Math.random() * 9) + 1;
    const newShape: Shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    setActiveBox(newBox);
    setCurrentNumber(newNumber);
    setCurrentShape(newShape);
    setTrialStartTime(Date.now());
    setHasResponded(false);
    setFeedback('');
    
    timeoutRef.current = window.setTimeout(() => {
      handleTimeout();
    }, 2500);
  }, []);

  const handleTimeout = useCallback(() => {
    if (hasResponded || !gameStarted) return;
    
    setHasResponded(true);
    setTotalTrials(prev => prev + 1);
    setScore(prev => Math.max(0, prev - 10));
    setStreak(0);
    setFeedback('✗ Too slow!');
    
    feedbackTimeoutRef.current = window.setTimeout(() => {
      generateNewTrial();
    }, 300);
  }, [hasResponded, gameStarted, generateNewTrial]);

  const startGame = (): void => {
    setGameStarted(true);
    setScore(0);
    setStreak(0);
    setReactionTimes([]);
    setTotalTrials(0);
    setCorrectTrials(0);
    setHasResponded(false);
    generateNewTrial();
  };

  const endGame = (): void => {
    setGameStarted(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    
    const avgReaction: string = reactionTimes.length > 0 
      ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length).toFixed(0)
      : '0';
    
    setFeedback(`Game Over! Final Score: ${score} | Accuracy: ${totalTrials > 0 ? ((correctTrials/totalTrials)*100).toFixed(1) : 0}% | Avg Reaction: ${avgReaction}ms`);
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!gameStarted || !trialStartTime || hasResponded || !currentShape) return;
    
    const key: string = e.key.toLowerCase();
    if (key !== 'q' && key !== 'p') return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHasResponded(true);

    const reactionTime: number = Date.now() - trialStartTime;
    let isCorrect: boolean = false;

    if (activeBox === 'top') {
      isCorrect = (currentNumber % 2 === 0 && key === 'q') || 
                  (currentNumber % 2 !== 0 && key === 'p');
    } else {
      isCorrect = (currentShape.isRound && key === 'q') || 
                  (!currentShape.isRound && key === 'p');
    }

    setTotalTrials(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + Math.max(10, 100 - Math.floor(reactionTime / 20)));
      setStreak(prev => prev + 1);
      setCorrectTrials(prev => prev + 1);
      setReactionTimes(prev => [...prev, reactionTime]);
      setFeedback('✓ Correct!');
    } else {
      setScore(prev => Math.max(0, prev - 5));
      setStreak(0);
      setFeedback('✗ Wrong!');
    }

    feedbackTimeoutRef.current = window.setTimeout(() => {
      generateNewTrial();
    }, 300);
  }, [gameStarted, activeBox, currentNumber, currentShape, trialStartTime, hasResponded, generateNewTrial]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      if (gameStarted && !hasResponded && trialStartTime) {
        timeoutRef.current = window.setTimeout(() => {
          handleTimeout();
        }, 2500 - (Date.now() - trialStartTime));
      }
    }
  }, [handleTimeout, gameStarted, hasResponded, trialStartTime]);

  useEffect(() => {
    const handleKeyDown = (e: Event) => handleKeyPress(e as KeyboardEvent);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress]);

  // Clean up timers only when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameStarted && totalTrials >= 30) {
      endGame();
    }
  }, [totalTrials, gameStarted]);

  const ShapeComponent = currentShape?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Task Switching Game</h1>
          <button
            onClick={onBackToMenu}
            className="flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            Menu
          </button>
        </div>
        
        {!gameStarted ? (
          <div className="text-center space-y-6">
            <div className="bg-white/20 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-semibold mb-4">How to Play</h2>
              <div className="space-y-3 text-left max-w-md mx-auto">
                <p><span className="font-semibold">Top Box:</span> Press Q for even numbers, P for odd numbers</p>
                <p><span className="font-semibold">Bottom Box:</span> Press Q for round shapes, P for angular shapes</p>
                <p className="text-sm opacity-80 pt-2">Complete 30 trials. You have 2.5 seconds per trial!</p>
              </div>
            </div>
            
            {feedback && (
              <div className="bg-white/20 rounded-xl p-4 text-white text-lg">
                {feedback}
              </div>
            )}
            
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold text-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-lg"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between text-white mb-4">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-sm opacity-80">Score</span>
                <p className="text-2xl font-bold">{score}</p>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-sm opacity-80">Streak</span>
                <p className="text-2xl font-bold">{streak}</p>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-sm opacity-80">Trial</span>
                <p className="text-2xl font-bold">{totalTrials}/30</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`relative bg-gradient-to-r ${
                activeBox === 'top' 
                  ? 'from-blue-500 to-cyan-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]' 
                  : 'from-gray-600 to-gray-700 opacity-50'
              } rounded-2xl p-8 transition-all duration-300 transform ${
                activeBox === 'top' ? 'scale-105' : 'scale-95'
              }`}>
                <div className="absolute top-2 left-2 text-white/80 text-sm font-semibold">
                  TOP (Even=Q, Odd=P)
                </div>
                {activeBox === 'top' && ShapeComponent && (
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <ShapeComponent size={80} className="text-white/30" strokeWidth={2} />
                      <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white">
                        {currentNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className={`relative bg-gradient-to-r ${
                activeBox === 'bottom' 
                  ? 'from-purple-500 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]' 
                  : 'from-gray-600 to-gray-700 opacity-50'
              } rounded-2xl p-8 transition-all duration-300 transform ${
                activeBox === 'bottom' ? 'scale-105' : 'scale-95'
              }`}>
                <div className="absolute top-2 left-2 text-white/80 text-sm font-semibold">
                  BOTTOM (Round=Q, Angular=P)
                </div>
                {activeBox === 'bottom' && ShapeComponent && (
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <ShapeComponent size={80} className="text-white" strokeWidth={2} fill="currentColor" />
                      <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-purple-900">
                        {currentNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {feedback && (
              <div className={`text-center text-2xl font-bold ${
                feedback.includes('✓') ? 'text-green-400' : 'text-red-400'
              } animate-pulse`}>
                {feedback}
              </div>
            )}
            
            {!feedback && (
              <div className="text-center text-white/60 text-sm">
                Press Q or P to respond (2.5s time limit)
              </div>
            )}

            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${(totalTrials / 30) * 100}%` }}
              />
            </div>

            <button
              onClick={endGame}
              className="px-6 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors mx-auto block"
            >
              End Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskSwitchingGame;