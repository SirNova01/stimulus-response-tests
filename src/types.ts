// Shared type definitions for all game components

export type GameType = 'taskSwitching' | 'mathMemory' | null;
export type GameState = 'menu' | 'playing' | 'recall' | 'feedback' | 'gameOver';
export type BoxPosition = 'top' | 'bottom';
export type MathOperation = '+' | '-' | '×' | '÷';
export type ItemType = 'letters' | 'words' | 'mixed';
export type MathType = 'addition' | 'mixed_basic' | 'multiplication' | 'all';

export interface Shape {
  name: string;
  component: React.ComponentType<{ 
    size?: number; 
    className?: string; 
    strokeWidth?: number; 
    fill?: string 
  }>;
  isRound: boolean;
}

export interface MathProblem {
  a: number;
  b: number;
  operation: MathOperation;
  answer: number;
}

export interface LevelConfig {
  name: string;
  sequenceLength: number;
  mathType: MathType;
  mathRange: [number, number];
  itemType: ItemType;
  mathTime: number;
  memoryTime: number;
  color: string;
}

export interface GameProps {
  onBackToMenu: () => void;
}