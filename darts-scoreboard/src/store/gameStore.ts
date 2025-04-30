import { create } from 'zustand';
import { Modifier } from '../constants';

interface Player {
  name: string;
  score: number;
  throws: number[];
  place?: number;
  lastThrow?: number;
  message?: string;
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
}

const fetchInsultMessage = async (score: number): Promise<string> => {
  try {
    const prompt = `Притворись злым комментатором по игре в дартс. Ты язвительный, агрессивный и честный, хамский, матерящийся. Оцени результат игрока — он набрал ${score} очков (максимум — 180).

    Если результат:
    - Меньше 30 — унижай, гнобь, стыди.
    - От 30 до 50 — язвительно комментируй
    - От 50 до 160 — восхищайся, но по-грубому, без уважения с сарказмом.
    - Выше 160 — восхищайся, как будто сам бог сошел на землю.

    Ответь коротко, не больше 60 символов. Без фильтров.
    /no_think`;
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:8b",
        prompt,
        max_tokens: 60,
        temperature: 0.7,
        stream: false,
      }),
    });
    const data = await response.json();
    return data.response?.replace(/<think>|<\/think>/g, "").trim() || "Блять, нейронка сдохла, но ты лох!";
  } catch (error) {
    console.error("Ошибка API:", error);
    return "Блять, нейронка сдохла, но ты всё равно лох!";
  }
};

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
  useNeuralCommentator: true,

  addPlayer: (name) =>
    set((state) => ({
      players: [...state.players, { name, score: 501, throws: [] }],
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
    const isBust = totalScore > currentPlayer.score;
    const newScore = isBust ? currentPlayer.score : currentPlayer.score - totalScore;
  
    const newPlayers = [...state.players];
    newPlayers[state.currentPlayerIndex] = {
      ...currentPlayer,
      score: newScore,
      throws: isBust
        ? [...currentPlayer.throws]
        : [...currentPlayer.throws, totalScore],
      lastThrow: totalScore,
      message: undefined, // сбрасываем
    };
  
    let newPlace = 1;
    const sortedPlayers = [...newPlayers].sort((a, b) => b.score - a.score);
    sortedPlayers.forEach((player) => {
      if (player.score === 0 && !player.place) {
        player.place = newPlace++;
      } else if (player.score > 0) {
        player.place = undefined;
      }
    });
  
    const allFinished = newPlayers.every((player) => player.score === 0);
    const nextPlayerIndex =
      newPlayers.findIndex((p, i) => i > state.currentPlayerIndex && p.score > 0) !== -1
        ? newPlayers.findIndex((p, i) => i > state.currentPlayerIndex && p.score > 0)
        : newPlayers.findIndex((p) => p.score > 0);
  

    set({
      players: newPlayers,
      currentPlayerIndex: allFinished ? state.currentPlayerIndex : nextPlayerIndex === -1 ? 0 : nextPlayerIndex,
      throwInputs: [[undefined, ""], [undefined, ""], [undefined, ""]],
      gameEnded: allFinished,
      round: allFinished
        ? state.round
        : state.currentPlayerIndex > nextPlayerIndex
        ? state.round + 1
        : state.round,
    });
  
    if (state.useNeuralCommentator && totalScore > 0) {
      fetchInsultMessage(totalScore).then((message) => {
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

  setUseNeuralCommentator: (value) => set({ useNeuralCommentator: value }),
}));