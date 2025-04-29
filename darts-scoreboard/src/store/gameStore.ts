import { create } from 'zustand';
import { Modifier } from '../constants';

interface Player {
  name: string;
  score: number;
  throws: number[];
  place?: number;
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gameStarted: boolean;
  gameEnded: boolean;
  inputName: string;
  throwInputs: Array<[number | undefined, Modifier]>;
  historyPlayer: Player | null;
  error: string | null;
  round: number; // Новый стейт для раунда
  addPlayer: (name: string) => void;
  startGame: () => void;
  handleThrowInput: (rowIndex: number, score: number | undefined, modifier: Modifier) => void;
  submitThrows: () => void;
  resetGame: () => void;
  setHistoryPlayer: (player: Player | null) => void;
  setInputName: (name: string) => void;
  calculateThrowScore: (rowIndex: number) => number;
  calculateTotalScore: () => number;
  clearError: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  players: [],
  currentPlayerIndex: 0,
  gameStarted: false,
  gameEnded: false,
  inputName: '',
  throwInputs: [[undefined, ''], [undefined, ''], [undefined, '']],
  historyPlayer: null,
  error: null,
  round: 1, // Начинаем с 1-го раунда

  addPlayer: (name) =>
    set((state) => ({
      players: [...state.players, { name, score: 501, throws: [], place: undefined }],
      inputName: '',
    })),

  startGame: () =>
    set((state) => ({
      gameStarted: state.players.length > 0,
      throwInputs: [[undefined, ''], [undefined, ''], [undefined, '']],
      round: 1,
      error: null,
    })),

  handleThrowInput: (rowIndex, score, modifier) =>
    set((state) => {
      const newThrowInputs = [...state.throwInputs];
      newThrowInputs[rowIndex] = [score, modifier];
      return { throwInputs: newThrowInputs, error: null }; // Сбрасываем ошибку при вводе
    }),

  submitThrows: () => {
    const state = get();
    const totalScore = state.calculateTotalScore();
    const currentPlayer = state.players[state.currentPlayerIndex];
    const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    const newRound = nextPlayerIndex === 0 ? state.round + 1 : state.round;

    if (totalScore > currentPlayer.score) {
      set({
        error: 'Переброс, дебил! Введи очки не больше, чем осталось!',
        throwInputs: [[undefined, ''], [undefined, ''], [undefined, '']],
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
      });
      return;
    }

    if (totalScore <= currentPlayer.score) {
      set((state) => {
        const newPlayers = [...state.players];
        newPlayers[state.currentPlayerIndex] = {
          ...currentPlayer,
          score: currentPlayer.score - totalScore,
          throws: [...currentPlayer.throws, totalScore],
        };
        return {
          players: newPlayers,
          throwInputs: [[undefined, ''], [undefined, ''], [undefined, '']],
          currentPlayerIndex: nextPlayerIndex,
          gameEnded: newPlayers[state.currentPlayerIndex].score === 0,
          round: newRound,
          error: null,
        };
      });
    }
  },

  resetGame: () =>
    set({
      players: [],
      currentPlayerIndex: 0,
      gameStarted: false,
      gameEnded: false,
      inputName: '',
      throwInputs: [[undefined, ''], [undefined, ''], [undefined, '']],
      historyPlayer: null,
      error: null,
      round: 1,
    }),

  setHistoryPlayer: (player) => set({ historyPlayer: player }),

  setInputName: (name) => set({ inputName: name }),

  calculateThrowScore: (rowIndex) => {
    const throwInput = get().throwInputs[rowIndex];
    if (!throwInput) return 0;
    const [score, modifier] = throwInput;
    if (!score) return 0;
    switch (modifier) {
      case 'x2':
        return score * 2;
      case 'x3':
        return score * 3;
      case '25':
        return 25;
      case '50':
        return 50;
      default:
        return score;
    }
  },

  calculateTotalScore: () => {
    return get().throwInputs.reduce((sum, _, index) => sum + get().calculateThrowScore(index), 0);
  },

  clearError: () => set({ error: null }),
}));