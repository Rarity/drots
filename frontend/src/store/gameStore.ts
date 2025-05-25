import { create } from 'zustand';
import { Modifier } from '../constants';
import { fetchInsultMessage, Vibe } from '../api/neuroApi';
import { speakText } from '../utils/speakText';

interface Player {
  name: string;
  score: number;
  throws: number[];
  place?: number;
  lastThrow?: number;
  message?: string;
  isBust?: boolean;
  rounds: number; // Добавляем поле для хранения количества раундов
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
  removePlayer: (index: number) => void;
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
  shufflePlayers: () => void;
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
    set((state) => {
      if (!name.trim()) {
        return { error: 'Имя не может быть пустым, дебил!' };
      }
      if (state.players.some((p) => p.name === name)) {
        return { error: 'Игрок с таким именем уже есть, дебил!' };
      }
      return {
        players: [...state.players, { name, score: state.initialScore, throws: [], rounds: 0 }],
        inputName: '',
        error: null,
      };
    }),

  removePlayer: (index) =>
    set((state) => {
      const newPlayers = [...state.players];
      newPlayers.splice(index, 1);
      return { players: newPlayers };
    }),

  startGame: () =>
    set((state) => {
      if (state.players.length === 0) {
        return { error: 'Добавь хотя бы одного игрока, дебил!' };
      }
      return {
        players: state.players.map((player) => ({
          ...player,
          score: state.initialScore,
          rounds: 0,
        })),
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
      rounds: currentPlayer.score > 0 || newScore === 0 ? currentPlayer.rounds + 1 : currentPlayer.rounds, // Увеличиваем rounds для активного игрока
    };

    // Присваиваем места
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
    let nextPlayerIndex = state.currentPlayerIndex;

    if (!allFinished) {
      let found = false;
      for (let i = 1; i <= state.players.length; i++) {
        const nextIndex = (state.currentPlayerIndex + i) % state.players.length;
        if (newPlayers[nextIndex].score > 0) {
          nextPlayerIndex = nextIndex;
          found = true;
          break;
        }
      }
      if (!found) {
        nextPlayerIndex = 0;
      }
    }

    const activePlayers = newPlayers.filter((p) => p.score > 0);
    const isNewRound =
      !allFinished &&
      (nextPlayerIndex <= state.currentPlayerIndex ||
        nextPlayerIndex === 0 ||
        activePlayers.length === 1);

    set({
      players: newPlayers,
      currentPlayerIndex: nextPlayerIndex,
      throwInputs: Array(THROW_COUNT).fill([undefined, ''] as [number | undefined, Modifier]),
      gameEnded: allFinished,
      round: allFinished ? state.round : isNewRound ? state.round + 1 : state.round,
    });

    if (state.useNeuralCommentator) {
      fetchInsultMessage({
        totalScore,
        player: currentPlayer.name,
        isBust,
        newScore,
        place: newPlayers[state.currentPlayerIndex].place,
      }, state.vibe).then((message) => {
        set((prev) => {
          const updatedPlayers = [...prev.players];
          updatedPlayers[state.currentPlayerIndex] = {
            ...updatedPlayers[state.currentPlayerIndex],
            message,
          };
          return { players: updatedPlayers };
        });
        speakText(message, 'Милена');
      }).catch((e) => {
        console.error("Ошибка нейрокомментатора, дебил!", e);
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
    set(() => {
      return { useNeuralCommentator: value };
    }),

  setVibe: (vibe) => set({ vibe }),

  setInitialScore: (score) => set({ initialScore: score }),

  shufflePlayers: () => set((state) => {
    const shuffled = [...state.players].sort(() => Math.random() - 0.5);
    return { players: shuffled };
  }),
}));