import { create } from 'zustand';
import { Modifier } from '../constants';
import { fetchInsultMessage, Vibe } from '../api/neuroApi';

interface Player {
  name: string;
  score: number;
  throws: number[];
  place?: number;
  lastThrow?: number;
  message?: string;
  isBust?: boolean;
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
  useNeuralCommentator: boolean;
  vibe: Vibe;
  initialScore: 301 | 501;
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
  setUseNeuralCommentator: (value: boolean) => void;
  setVibe: (vibe: Vibe) => void;
  setInitialScore: (score: 301 | 501) => void;
}

const THROW_COUNT = 3;

export const useGameStore = create<GameState>((set, get) => ({
  players: [],
  currentPlayerIndex: 0,
  gameStarted: false,
  gameEnded: false,
  inputName: '',
  throwInputs: Array(THROW_COUNT).fill([undefined, ''] as [number | undefined, Modifier]),
  historyPlayer: null,
  error: null,
  round: 1,
  useNeuralCommentator: true,
  vibe: 'angry',
  initialScore: 501,

  addPlayer: (name) =>
    set((state) => ({
      players: [...state.players, { name, score: state.initialScore, throws: [] }],
      inputName: '',
    })),

  startGame: () =>
    set((state) => {
      if (state.players.length === 0) {
        return { error: 'Добавь хотя бы одного игрока, дебил!' };
      }
      return {
        gameStarted: true,
        throwInputs: Array(THROW_COUNT).fill([undefined, ''] as [number | undefined, Modifier]),
        round: 1,
        error: null,
      };
    }),

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
    const isBust = totalScore > currentPlayer.score;
    const newScore = isBust ? currentPlayer.score : currentPlayer.score - totalScore;

    const newPlayers = [...state.players];
    newPlayers[state.currentPlayerIndex] = {
      ...currentPlayer,
      score: newScore,
      throws: isBust ? [...currentPlayer.throws] : [...currentPlayer.throws, totalScore],
      lastThrow: totalScore,
      message: undefined,
      isBust,
    };

    let nextPlace = 1;
    const usedPlaces = newPlayers
      .filter((p) => p.place !== undefined)
      .map((p) => p.place!)
      .sort((a, b) => a - b);
    while (usedPlaces.includes(nextPlace)) {
      nextPlace++;
    }
    newPlayers.forEach((player) => {
      if (player.score === 0 && !player.place) {
        player.place = nextPlace++;
        while (usedPlaces.includes(nextPlace)) {
          nextPlace++;
        }
      } else if (player.score > 0) {
        player.place = undefined;
      }
    });

    const allFinished = newPlayers.every((player) => player.score === 0);
    const nextPlayerIndex = allFinished
      ? state.currentPlayerIndex
      : newPlayers.findIndex((p, i) => i > state.currentPlayerIndex && p.score > 0) !== -1
      ? newPlayers.findIndex((p, i) => i > state.currentPlayerIndex && p.score > 0)
      : newPlayers.findIndex((p) => p.score > 0);

    set({
      players: newPlayers,
      currentPlayerIndex: nextPlayerIndex === -1 ? 0 : nextPlayerIndex,
      throwInputs: Array(THROW_COUNT).fill([undefined, ''] as [number | undefined, Modifier]),
      gameEnded: allFinished,
      round: allFinished
        ? state.round
        : state.currentPlayerIndex > nextPlayerIndex && nextPlayerIndex !== -1
        ? state.round + 1
        : state.round,
    });

    if (state.useNeuralCommentator && totalScore > 0) {
      fetchInsultMessage(totalScore, state.vibe).then((message) => {
        set((prev) => {
          const updatedPlayers = [...prev.players];
          updatedPlayers[state.currentPlayerIndex] = {
            ...updatedPlayers[state.currentPlayerIndex],
            message,
          };
          return { players: updatedPlayers };
        });
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
      throwInputs: Array(THROW_COUNT).fill([undefined, ''] as [number | undefined, Modifier]),
      historyPlayer: null,
      error: null,
      round: 1,
      useNeuralCommentator: false,
      vibe: 'angry',
      initialScore: 501,
    }),

  setHistoryPlayer: (player) => set({ historyPlayer: player }),

  setInputName: (name) => set({ inputName: name }),

  calculateThrowScore: (rowIndex) => {
    const throwInput = get().throwInputs[rowIndex];
    if (!throwInput) return 0;
    const [score, modifier] = throwInput;

    if (modifier === '25') return 25;
    if (modifier === '50') return 50;

    if (typeof score !== 'number') return 0;

    switch (modifier) {
      case 'x2':
        return score * 2;
      case 'x3':
        return score * 3;
      default:
        return score;
    }
  },

  calculateTotalScore: () => {
    return get().throwInputs.reduce((sum, _, index) => sum + get().calculateThrowScore(index), 0);
  },

  clearError: () => set({ error: null }),

  setUseNeuralCommentator: (value) =>
    set((state) => {
      console.log('setUseNeuralCommentator:', value);
      return { useNeuralCommentator: value };
    }),

  setVibe: (vibe) => set({ vibe }),

  setInitialScore: (score) => set({ initialScore: score }),
}));