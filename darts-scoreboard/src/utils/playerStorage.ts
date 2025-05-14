export interface SavedPlayer {
  name: string;
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
}

const STORAGE_KEY = 'savedPlayers';

export const getSavedPlayers = (): SavedPlayer[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Ошибка парсинга сохранённых игроков, дебил!", e);
    return [];
  }
};

export const savePlayerStats = (name: string, place: number) => {
  if (!name || ![1, 2, 3].includes(place)) return; // Валидация, дебил
  const saved = getSavedPlayers();
  let player = saved.find((p) => p.name === name);

  if (!player) {
    player = { name, medals: { gold: 0, silver: 0, bronze: 0 } };
    saved.push(player);
  }

  if (place === 1) player.medals.gold++;
  else if (place === 2) player.medals.silver++;
  else if (place === 3) player.medals.bronze++;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch (e) {
    console.error("Ошибка сохранения игроков, дебил!", e);
  }
};