export type Vibe = 'angry' | 'friendly' | 'pity';

interface GameState {
  totalScore: number,
  player: string,
  isBust: boolean,
  newScore: number,
}


export const fetchInsultMessage = async (gameState: GameState, vibe: Vibe): Promise<string> => {
  try {
    let prompt: string;
    if (gameState.isBust) {
      prompt = `Ты злой, хамский комментатор на дартсе, игрок по имени ${gameState.player} кинул больше чем надо и пропускает ход. Дай комментарий этого момента`
    }
    switch (vibe) {
      case 'angry':
        prompt = `Ты злой, хамский комментатор на дартсе. Игрок набрал по имени ${gameState.player} набрал ${gameState.totalScore} очков (макс. можно набрать за попытку 180).  Ему осталось ${gameState.newScore} очков
        - <30: гноби, унижай, матерись.
        - 30-50: язви, но с матом.
        - 50-160: грубо хвали, с сарказмом.
        - >160: ори, будто он бог.
        Коротко, до 60 символов, мат без цензуры. /no_think`;
        break;
      case 'friendly':
        prompt = `Ты дружелюбный комментатор на дартсе. Игрок набрал по имени ${gameState.player} набрал ${gameState.totalScore} очков (макс. можно набрать за попытку 180). Ему осталось ${gameState.newScore} очков
        - <30: мягко подбодри, без мата.
        - 30-50: похвали за усилие.
        - 50-160: хвали с энтузиазмом.
        - >160: восхищайся, как легендой.
        Коротко, до 60 символов. /no_think`;
        break;
      case 'pity':
        prompt = `Ты жалостливый комментатор на дартсе. Игрок набрал по имени ${gameState.player} набрал ${gameState.totalScore} очков (макс. можно набрать за попытку 180). Ему осталось ${gameState.newScore} очков
        - <30: пожалей, успокой.
        - 30-50: посочувствуй, но подбодри.
        - 50-160: похвали с сочувствием.
        - >160: восхищайся с теплотой.
        Коротко, до 60 символов. /no_think`;
        break;
      default:
        prompt = 'Что-то пошло не так, дебил! /no_think';
    }

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3:8b',
        prompt,
        max_tokens: 60,
        temperature: 0.7,
        stream: false,
      }),
    });
    const data = await response.json();
    return data.response?.replace(/<think>|<\/think>/g, "")?.trim()  || 'Блять, нейронка сдохла, но ты лох!';
  } catch (error) {
    console.error('Ошибка API:', error);
    return 'Блять, нейронка сдохла, но ты всё равно лох!';
  }
};