import React from 'react';
import { Brain, Zap, Calculator, Target, Timer, Trophy, TrendingUp } from 'lucide-react';
import type { GameType } from './types';

interface MainMenuProps {
  onSelectGame: (game: GameType) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelectGame }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Brain className="text-white mr-3" size={60} />
            <h1 className="text-5xl font-bold text-white">Cognitive Training Hub</h1>
          </div>
          <p className="text-xl text-white/70">Challenge your mind with scientifically-designed brain training games</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Task Switching Game Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 hover:bg-white/15 transition-all transform hover:scale-105 cursor-pointer"
               onClick={() => onSelectGame('taskSwitching')}>
            <div className="flex items-center mb-4">
              <Zap className="text-yellow-400 mr-3" size={40} />
              <h2 className="text-3xl font-bold text-white">Task Switching</h2>
            </div>
            
            <p className="text-white/80 mb-6">
              Test your cognitive flexibility by rapidly switching between different mental rules. 
              Make split-second decisions based on changing contexts.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-white/70">
                <Target className="mr-2" size={20} />
                <span>Improves: Executive Function</span>
              </div>
              <div className="flex items-center text-white/70">
                <Timer className="mr-2" size={20} />
                <span>2.5 second response window</span>
              </div>
              <div className="flex items-center text-white/70">
                <TrendingUp className="mr-2" size={20} />
                <span>30 trials per game</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl text-center font-semibold">
              Play Task Switching
            </div>
          </div>

          {/* Math + Memory Game Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 hover:bg-white/15 transition-all transform hover:scale-105 cursor-pointer"
               onClick={() => onSelectGame('mathMemory')}>
            <div className="flex items-center mb-4">
              <Calculator className="text-green-400 mr-3" size={40} />
              <h2 className="text-3xl font-bold text-white">Math + Memory</h2>
            </div>
            
            <p className="text-white/80 mb-6">
              Challenge your working memory by maintaining information while solving math problems. 
              A dual-task paradigm that trains cognitive capacity.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-white/70">
                <Target className="mr-2" size={20} />
                <span>Improves: Working Memory</span>
              </div>
              <div className="flex items-center text-white/70">
                <Trophy className="mr-2" size={20} />
                <span>6 difficulty levels</span>
              </div>
              <div className="flex items-center text-white/70">
                <TrendingUp className="mr-2" size={20} />
                <span>Progressive challenges</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl text-center font-semibold">
              Play Math + Memory
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 inline-block">
            <h3 className="text-white font-semibold mb-2">Why Brain Training?</h3>
            <p className="text-white/70 max-w-2xl">
              Regular cognitive training can improve processing speed, working memory, and executive function. 
              Just 10-15 minutes daily can help maintain and enhance mental agility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;