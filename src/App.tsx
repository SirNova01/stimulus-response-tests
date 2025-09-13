import React, { useState } from 'react';
import MainMenu from './MainMenu';
import TaskSwitchingGame from './TaskSwitchingGame';
import MathMemoryGame from './MathMemoryGame';
import type { GameType } from './types';

const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GameType>(null);

  const handleSelectGame = (game: GameType): void => {
    setCurrentGame(game);
  };

  const handleBackToMenu = (): void => {
    setCurrentGame(null);
  };

  if (currentGame === 'taskSwitching') {
    return <TaskSwitchingGame onBackToMenu={handleBackToMenu} />;
  }

  if (currentGame === 'mathMemory') {
    return <MathMemoryGame onBackToMenu={handleBackToMenu} />;
  }

  return <MainMenu onSelectGame={handleSelectGame} />;
};

export default App;