import React, { useState, useEffect, useRef } from 'react';
import { Brain, Trophy, ArrowLeft, RotateCcw } from 'lucide-react';

// Type definitions
type GameState = 'menu' | 'playing' | 'recall' | 'feedback' | 'gameOver';
type MathOperation = '+' | '-' | '×' | '÷';
type ItemType = 'letters' | 'words' | 'mixed';
type MathType = 'addition' | 'mixed_basic' | 'multiplication' | 'all';

interface GameProps {
  onBackToMenu: () => void;
}

interface MathProblem {
  a: number;
  b: number;
  operation: MathOperation;
  answer: number;
}

interface LevelConfig {
  name: string;
  sequenceLength: number;
  mathType: MathType;
  mathRange: [number, number];
  itemType: ItemType;
  mathTime: number;
  memoryTime: number;
  color: string;
}

const MathMemoryGame: React.FC<GameProps> = ({ onBackToMenu }) => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  
  const [memorySequence, setMemorySequence] = useState<string[]>([]);
  const [currentMemoryItem, setCurrentMemoryItem] = useState<string>('');
  const [currentMathProblem, setCurrentMathProblem] = useState<MathProblem | null>(null);
  const [userMathAnswer, setUserMathAnswer] = useState<string>('');
  const [userMemoryAnswer, setUserMemoryAnswer] = useState<string>('');
  
  const [mathCorrect, setMathCorrect] = useState<number>(0);
  const [mathTotal, setMathTotal] = useState<number>(0);
  const [memoryStreak, setMemoryStreak] = useState<number>(0);
  const [showingItem, setShowingItem] = useState<boolean>(false);
  const [itemsShown, setItemsShown] = useState<number>(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState<number>(0);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const sequenceRef = useRef<string[]>([]);

  const levelConfigs: Record<number, LevelConfig> = {
    1: {
      name: 'Beginner',
      sequenceLength: 3,
      mathType: 'addition',
      mathRange: [1, 10],
      itemType: 'letters',
      mathTime: 8,
      memoryTime: 2,
      color: 'from-green-500 to-emerald-500'
    },
    2: {
      name: 'Easy',
      sequenceLength: 4,
      mathType: 'addition',
      mathRange: [5, 20],
      itemType: 'letters',
      mathTime: 7,
      memoryTime: 2,
      color: 'from-blue-500 to-cyan-500'
    },
    3: {
      name: 'Medium',
      sequenceLength: 5,
      mathType: 'mixed_basic',
      mathRange: [10, 30],
      itemType: 'letters',
      mathTime: 6,
      memoryTime: 1.5,
      color: 'from-purple-500 to-pink-500'
    },
    4: {
      name: 'Hard',
      sequenceLength: 6,
      mathType: 'mixed_basic',
      mathRange: [10, 50],
      itemType: 'words',
      mathTime: 6,
      memoryTime: 2,
      color: 'from-orange-500 to-red-500'
    },
    5: {
      name: 'Expert',
      sequenceLength: 7,
      mathType: 'multiplication',
      mathRange: [2, 12],
      itemType: 'words',
      mathTime: 5,
      memoryTime: 1.5,
      color: 'from-red-600 to-purple-600'
    },
    6: {
      name: 'Master',
      sequenceLength: 8,
      mathType: 'all',
      mathRange: [10, 100],
      itemType: 'mixed',
      mathTime: 5,
      memoryTime: 1.5,
      color: 'from-gray-900 to-gray-700'
    }
  };

  const simpleWords: string[] = ['CAT', 'DOG', 'SUN', 'MOON', 'TREE', 'BOOK', 'DOOR', 'FISH', 'BIRD', 'STAR', 'DESK', 'LAMP'];
  const letters: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const generateMemoryItem = (currentLevel: number): string => {
    const config = levelConfigs[currentLevel];
    if (config.itemType === 'letters') {
      return letters[Math.floor(Math.random() * letters.length)];
    } else if (config.itemType === 'words') {
      return simpleWords[Math.floor(Math.random() * simpleWords.length)];
    } else {
      return Math.random() < 0.5 
        ? letters[Math.floor(Math.random() * letters.length)]
        : simpleWords[Math.floor(Math.random() * simpleWords.length)];
    }
  };

  const generateMathProblem = (currentLevel: number): MathProblem => {
    const config = levelConfigs[currentLevel];
    const [min, max] = config.mathRange;
    
    let a: number, b: number, operation: MathOperation, answer: number;
    
    switch(config.mathType) {
      case 'addition':
        a = Math.floor(Math.random() * (max - min + 1)) + min;
        b = Math.floor(Math.random() * (max - min + 1)) + min;
        operation = '+';
        answer = a + b;
        break;
      
      case 'mixed_basic':
        a = Math.floor(Math.random() * (max - min + 1)) + min;
        b = Math.floor(Math.random() * (max - min + 1)) + min;
        if (Math.random() < 0.5) {
          operation = '+';
          answer = a + b;
        } else {
          if (a < b) [a, b] = [b, a];
          operation = '-';
          answer = a - b;
        }
        break;
      
      case 'multiplication':
        a = Math.floor(Math.random() * (max - min + 1)) + min;
        b = Math.floor(Math.random() * 10) + 2;
        operation = '×';
        answer = a * b;
        break;
      
      case 'all':
        const ops: MathOperation[] = ['+', '-', '×', '÷'];
        operation = ops[Math.floor(Math.random() * ops.length)];
        
        if (operation === '÷') {
          b = Math.floor(Math.random() * 10) + 2;
          answer = Math.floor(Math.random() * 20) + 1;
          a = b * answer;
        } else if (operation === '×') {
          a = Math.floor(Math.random() * 15) + 2;
          b = Math.floor(Math.random() * 10) + 2;
          answer = a * b;
        } else {
          a = Math.floor(Math.random() * (max - min + 1)) + min;
          b = Math.floor(Math.random() * (max - min + 1)) + min;
          if (operation === '-' && a < b) [a, b] = [b, a];
          answer = operation === '+' ? a + b : a - b;
        }
        break;
      
      default:
        a = 1;
        b = 1;
        operation = '+';
        answer = 2;
    }
    
    return { a, b, operation, answer };
  };

  const startGame = (selectedLevel: number): void => {
    setLevel(selectedLevel);
    setScore(0);
    setRound(1);
    setLives(3);
    setMemorySequence([]);
    sequenceRef.current = [];
    setItemsShown(0);
    setMathCorrect(0);
    setMathTotal(0);
    setMemoryStreak(0);
    startNewRound(selectedLevel);
  };

  const startNewRound = (currentLevel: number): void => {
    setMemorySequence([]);
    sequenceRef.current = [];
    setItemsShown(0);
    setUserMemoryAnswer('');
    showNextMemoryItem(currentLevel);
  };

  const showNextMemoryItem = (currentLevel: number): void => {
    const config = levelConfigs[currentLevel];
    const newItem = generateMemoryItem(currentLevel);
    
    setCurrentMemoryItem(newItem);
    setShowingItem(true);
    setGameState('playing');
    setPhaseTimeLeft(config.memoryTime);
    
    setTimeout(() => {
      setShowingItem(false);
      sequenceRef.current = [...sequenceRef.current, newItem];
      setMemorySequence(prev => [...prev, newItem]);
      const newItemsShown = sequenceRef.current.length;
      setItemsShown(newItemsShown);
      
      setTimeout(() => {
        if (newItemsShown < config.sequenceLength) {
          showMathProblem(currentLevel);
        } else {
          startRecallPhase();
        }
      }, 500);
    }, config.memoryTime * 1000);
  };

  const showMathProblem = (currentLevel: number): void => {
    const config = levelConfigs[currentLevel];
    const problem = generateMathProblem(currentLevel);
    
    setCurrentMathProblem(problem);
    setUserMathAnswer('');
    setPhaseTimeLeft(config.mathTime);
    
    if (timerRef.current) clearInterval(timerRef.current);
    let timeLeft = config.mathTime;
    
    timerRef.current = window.setInterval(() => {
      timeLeft -= 0.1;
      setPhaseTimeLeft(Math.max(0, timeLeft));
      
      if (timeLeft <= 0) {
        clearInterval(timerRef.current!);
        handleMathTimeout(currentLevel);
      }
    }, 100);
  };

  const handleMathTimeout = (currentLevel: number): void => {
    setMathTotal(prev => prev + 1);
    setScore(prev => Math.max(0, prev - 5));
    setCurrentMathProblem(null);
    
    setTimeout(() => showNextMemoryItem(currentLevel), 1000);
  };

  const handleMathSubmit = (e?: React.KeyboardEvent | React.MouseEvent): void => {
    if (e) e.preventDefault();
    if (!currentMathProblem || userMathAnswer === '') return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    const isCorrect = parseInt(userMathAnswer) === currentMathProblem.answer;
    
    setMathTotal(prev => prev + 1);
    if (isCorrect) {
      setMathCorrect(prev => prev + 1);
      setScore(prev => prev + 10);
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }
    
    setCurrentMathProblem(null);
    setTimeout(() => showNextMemoryItem(level), 500);
  };

  const startRecallPhase = (): void => {
    setGameState('recall');
    setUserMemoryAnswer('');
    setCurrentMathProblem(null);
    setShowingItem(false);
  };

  const handleMemorySubmit = (e?: React.KeyboardEvent | React.MouseEvent): void => {
    if (e) e.preventDefault();
    
    const userItems = userMemoryAnswer.toUpperCase().split(/[\s,]+/).filter(item => item);
    const correct = sequenceRef.current.map(item => item.toUpperCase());
    
    let isCorrect = userItems.length === correct.length;
    if (isCorrect) {
      for (let i = 0; i < correct.length; i++) {
        if (userItems[i] !== correct[i]) {
          isCorrect = false;
          break;
        }
      }
    }
    
    setIsCorrectFeedback(isCorrect);
    
    if (isCorrect) {
      setScore(prev => prev + 50);
      setMemoryStreak(prev => prev + 1);
      setGameState('feedback');
      
      setTimeout(() => {
        if (round >= 5) {
          if (level < 6) {
            setLevel(prev => prev + 1);
            setRound(1);
            startNewRound(level + 1);
          } else {
            setGameState('gameOver');
          }
        } else {
          setRound(prev => prev + 1);
          startNewRound(level);
        }
      }, 2000);
    } else {
      setLives(prev => prev - 1);
      setMemoryStreak(0);
      setGameState('feedback');
      
      setTimeout(() => {
        if (lives <= 1) {
          setGameState('gameOver');
        } else {
          startNewRound(level);
        }
      }, 2000);
    }
  };

  const resetGame = (): void => {
    setGameState('menu');
    setLevel(1);
    setScore(0);
    setRound(1);
    setLives(3);
    setMemorySequence([]);
    sequenceRef.current = [];
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const config = levelConfigs[level];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-3xl w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Brain className="text-white mr-3" size={40} />
            <h1 className="text-4xl font-bold text-white">Math + Memory</h1>
          </div>
          <button
            onClick={onBackToMenu}
            className="flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            Menu
          </button>
        </div>

        {gameState === 'menu' && (
          <div className="space-y-6">
            <div className="bg-white/20 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-semibold mb-4">How to Play</h2>
              <div className="space-y-2 text-sm">
                <p>1. Memorize letters/words shown one at a time</p>
                <p>2. Solve math problems between each memory item</p>
                <p>3. Recall all items in the exact order</p>
                <p>4. Complete 5 rounds to advance levels!</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(levelConfigs).map(([lvl, cfg]) => (
                <button
                  key={lvl}
                  onClick={() => startGame(parseInt(lvl))}
                  className={`bg-gradient-to-r ${cfg.color} p-4 rounded-xl text-white hover:scale-105 transform transition-all`}
                >
                  <div className="font-bold text-lg">Level {lvl}</div>
                  <div className="text-sm opacity-90">{cfg.name}</div>
                  <div className="text-xs mt-1 opacity-80">
                    {cfg.sequenceLength} items • {cfg.mathType.replace('_', ' ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-6">
            <div className="flex justify-between text-white">
              <div className="bg-white/20 rounded-lg px-3 py-2 text-sm">
                <span className="opacity-80">Level:</span> {level} - {config.name}
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-2 text-sm">
                <span className="opacity-80">Round:</span> {round}/5
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-2 text-sm">
                <span className="opacity-80">Score:</span> {score}
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-2 text-sm">
                <span className="opacity-80">Lives:</span> {'❤️'.repeat(lives)}
              </div>
            </div>

            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className={`bg-gradient-to-r ${config.color} h-full transition-all duration-300`}
                style={{ width: `${(itemsShown / config.sequenceLength) * 100}%` }}
              />
            </div>

            {showingItem ? (
              <div className="bg-white/20 rounded-2xl p-12 text-center">
                <div className="text-sm text-white/60 mb-4">Remember this:</div>
                <div className="text-6xl font-bold text-white animate-pulse">
                  {currentMemoryItem}
                </div>
                <div className="mt-4 text-white/60">
                  Item {itemsShown + 1} of {config.sequenceLength}
                </div>
              </div>
            ) : currentMathProblem && (
              <div className="bg-white/20 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <div className="text-sm text-white/60 mb-2">Solve:</div>
                  <div className="text-4xl font-bold text-white">
                    {currentMathProblem.a} {currentMathProblem.operation} {currentMathProblem.b} = ?
                  </div>
                </div>
                
                <input
                  type="number"
                  value={userMathAnswer}
                  onChange={(e) => setUserMathAnswer(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleMathSubmit(e);
                    }
                  }}
                  className="w-full px-4 py-3 text-2xl text-center bg-white/20 rounded-xl text-white placeholder-white/50 border border-white/30"
                  placeholder="Your answer"
                  autoFocus
                />
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-white/60 text-sm">
                    Time: {phaseTimeLeft.toFixed(1)}s
                  </div>
                  <button
                    onClick={handleMathSubmit}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-2">
              {Array.from({ length: config.sequenceLength }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < itemsShown ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {gameState === 'recall' && (
          <div className="space-y-6">
            <div className="text-center text-white mb-4">
              <h2 className="text-2xl font-bold mb-2">Memory Recall</h2>
              <p className="text-white/60">Enter all items in the order they appeared</p>
              <p className="text-sm text-white/40 mt-1">Separate items with spaces or commas</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={userMemoryAnswer}
                onChange={(e) => setUserMemoryAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleMemorySubmit(e);
                  }
                }}
                className="w-full px-4 py-3 text-xl text-center bg-white/20 rounded-xl text-white placeholder-white/50 border border-white/30"
                placeholder={config.itemType === 'letters' ? 'e.g., A B C D' : 'e.g., CAT DOG SUN'}
                autoFocus
              />
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleMemorySubmit}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold"
                >
                  Check Answer
                </button>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 text-white/60 text-sm">
              <p>Sequence length: {config.sequenceLength} items</p>
              <p>Math problems solved: {mathCorrect}/{mathTotal}</p>
            </div>
          </div>
        )}

        {gameState === 'feedback' && (
          <div className="text-center space-y-6">
            <div className="text-6xl animate-bounce">
              {isCorrectFeedback ? '✅' : '❌'}
            </div>
            <div className="text-2xl font-bold text-white">
              {isCorrectFeedback ? 'Correct!' : 'Incorrect'}
            </div>
            <div className="text-white/60">
              The sequence was: {sequenceRef.current.join(' → ')}
            </div>
            <div className="text-white/80">
              Memory Streak: {memoryStreak}
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="text-center space-y-6">
            <Trophy className="text-yellow-400 mx-auto" size={80} />
            <h2 className="text-3xl font-bold text-white">Game Over!</h2>
            <div className="bg-white/20 rounded-xl p-6 text-white space-y-2">
              <p className="text-2xl">Final Score: {score}</p>
              <p>Level Reached: {level} - {config.name}</p>
              <p>Math Accuracy: {mathTotal > 0 ? ((mathCorrect/mathTotal)*100).toFixed(1) : 0}%</p>
              <p>Best Memory Streak: {memoryStreak}</p>
            </div>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-semibold flex items-center mx-auto"
            >
              <RotateCcw className="mr-2" size={20} />
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathMemoryGame;