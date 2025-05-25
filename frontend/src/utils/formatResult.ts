import { Player } from '../store/gameStore';
import { getMedal } from './index'; // Укажи правильный путь к getMedal, если не в index.ts

export const formatResultsTable = (players: Player[], round: number): string => {
  const header = '| Место | Игрок | Медаль | Раунды |\n|-------|-------|--------|--------|\n';
  const rows = players
    .sort((a, b) => (a.place || Infinity) - (b.place || Infinity))
    .map(
      (player) =>
        `| ${player.place || '-'} | ${player.name} | ${getMedal(player.place) || '-'} | ${player.rounds} |`
    )
    .join('\n');
  return `### Игра окончена! 🎯\n${header}${rows}\n\n**Всего раундов сыграно: ${round - 1}**`;
};