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
  round: number;
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
  round: 1,

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
      return { throwInputs: newThrowInputs, error: null };
    }),

  submitThrows: () => {
    const state = get();
    const totalScore = state.calculateTotalScore();
    const currentPlayer = state.players[state.currentPlayerIndex];

    // Находим следующий активный индекс (скипаем игроков с score === 0)
    let nextPlayerIndex = state.currentPlayerIndex;
    let newRound = state.round;
    do {
      nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length;
      if (nextPlayerIndex === 0) newRound += 1;
    } while (
      state.players[nextPlayerIndex]?.score === 0 &&
      nextPlayerIndex !== state.currentPlayerIndex
    );

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
        const newScore = currentPlayer.score - totalScore;
        const isFinish = newScore === 0;
        newPlayers[state.currentPlayerIndex] = {
          ...currentPlayer,
          score: newScore,
          throws: [...currentPlayer.throws, totalScore],
          place: isFinish
            ? (state.players.filter((p) => p.place).length + 1)
            : currentPlayer.place,
        };

        // Проверяем, все ли игроки закончили (score === 0)
        const allFinished = newPlayers.every((p) => p.score === 0);

        return {
          players: newPlayers,
          throwInputs: [[undefined, ''], [undefined, ''], [undefined, '']],
          currentPlayerIndex: nextPlayerIndex,
          gameEnded: allFinished,
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