export type Vibe = 'angry' | 'friendly' | 'pity';

interface GameState {
  totalScore: number;
  player: string;
  isBust: boolean;
  newScore: number;
  isFinished?: boolean;
  place?: number;
}

const insultWords: string[] = [
  'говно', 'залупа', 'хер', 'хуй', 'блядина', 'еблан', 'петух',
  'мудила', 'ссанина', 'очко', 'блядун', 'сука', 'ебланище',
  'пердун', 'дрочила', 'пидор', 'пизда', 'малафья', 'хуило',
  'мошонка', 'елда', 'хуесос', 'дерьмоед', 'дебилоид', 'гандон',
  'жополиз', 'срака', 'мудозвон', 'хуемразь', 'похабник'
];

const toxicTemplates: string[] = [
  '{player}, ты {insult}, кинул, будто мишень тебе в рожу плюнула!',
  '{insult} {player}, это дротик или ты говно в доску швыряешь?',
  'Вали нахуй, {insult}, мишень от твоих бросков блюёт!',
  'Ты чё, {insult}, дротик в жопу засунул и пёрнул?',
  'Это не бросок, {insult}, а пиздец!',
  '{player}, ты {insult}, кидаешь, как дебил после литра водяры!',
  'Серьёзно, {insult}? Бабка с костылём лучше попадает!',
  '{insult} {player}, твой бросок — просто ебанина!',
  '{insult} {player}, всю стену изтыкал!',
  '{insult} {player} дебил',
  '{insult} {player} я тебя ненавижу',
  '{insult} {player} Ты кидал в стену или просто тупой?',
  'мразь',
  '{insult} все понятно, ты просто пидор',
  'Сектор хуй на доске!',
  '{insult} {player}, ну ты прям учебник по проёбу.',
  '{insult} {player}, ты — диагноз, не игрок.',
  '{insult} {player}, ты кидаешь, как будто у тебя инсульт.',
  '{insult} {player}, у тебя руки из жопы и мозги там же.',
  '{insult} {player}, да ты родился, чтобы проёбывать.',
  '{insult} {player}, ты ссышь так же? понятно почему толчек всегда обоссан'
];

const finishTemplates: string[] = [
  '{player}, закрыл, {insult}, но не трынди, ты не бог дартса!',
  'Финиш, {insult}? Повезло, но ты всё равно лох!',
  '{player}, закрыл счёт, {insult}, но это твой максимум!',
  'Ого, {insult} {player}, финиш? Не зазнавайся, дебил!'
];

const topPlaceTemplates: string[] = [
  '{player}, {place}-е место? Для {insult} это просто фарт!',
  'Ты, {insult}, на {place}-м? Мишень тебя пожалела!',
  '{player}, {place}-е место? Даже {insult} иногда везёт!',
  '{insult} {player}, {place}-е? Не обольщайся, лошара!',
  '{insult} {player} на {place}-е? Конечно иногда попадаешь, но чаще в жопу'
];

const ultraLowScoreTemplates: string[] = [
  '{player}, {totalScore} очков? Ты, {insult}, просто позорище!',
  '{insult} {player}, {totalScore} очков? Иди в песочницу, дебил!',
  'Серьёзно, {insult}? {totalScore} очков — это дно дна!',
  '{player}, {totalScore} очков? Мой кот лучше кинет, {insult}!'
];

const closeToFinishTemplates: string[] = [
  '{player}, осталось {newScore}, но ты, {insult}, всё равно криво кинул!',
  'Ты, {insult}, почти закрыл, но {totalScore} — всё ещё хуйня!',
  '{player}, {newScore} до финиша, а ты, {insult}, всё портишь!',
  '{insult} {player}, {newScore} осталось, а бросок — говно!'
];

// Рандомный выбор элемента из массива
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Форматирование шаблона с подстановкой
const formatTemplate = (template: string, replacements: Record<string, string | number>): string => {
  return template.replace(/{(\w+)}/g, (_, key) => String(replacements[key] || ''));
};

// Получение сообщения на основе очков и остатка
const getScoreMessage = (totalScore: number, newScore: number): { message: string; template: string[] } => {
  if (totalScore < 10) {
    return { message: 'Разъеби за позорный счёт, это дно.', template: ultraLowScoreTemplates };
  } else if (newScore <= 10) {
    return { message: 'Смягчи, он почти закрыл, но всё равно лох.', template: closeToFinishTemplates };
  } else if (totalScore < 30) {
    return { message: 'это просто мусор.', template: toxicTemplates };
  } else if (totalScore < 60) {
    return { message: 'Попал, но всё равно дерьмо, скажи это.', template: toxicTemplates };
  } else if (totalScore < 100) {
    return { message: 'Не полное говно, но всё равно криво.', template: toxicTemplates };
  } else if (totalScore < 150) {
    return { message: 'Повезло, но он всё равно лох.', template: toxicTemplates };
  } else {
    return { message: 'Фартануло, но не бог, а просто лох.', template: toxicTemplates };
  }
};

export const fetchInsultMessage = async (gameState: GameState, vibe: Vibe): Promise<string> => {
  try {
    let prompt: string;
    const insult = getRandomElement(insultWords);
    const isFinished = gameState.newScore === 0; // Проверяем финиш по newScore
    const replacements = {
      player: gameState.player,
      insult,
      totalScore: gameState.totalScore,
      newScore: gameState.newScore,
      place: gameState.place || 0
    };

    if (gameState.isBust) {
      prompt = `Ты яростный комментатор дартса в дерзком уличном стиле. Игрок ${gameState.player} перекинул и проебал ход. Жёстко гноби, используй грубый тон, как будто он твой враг. ${formatTemplate(getRandomElement(toxicTemplates), replacements)} Одна строка, до 60 символов. Стиль — как 30 лет в пивнухе у мишени. В конце — мотивация.`;
    } else if (isFinished && gameState.place && gameState.place <= 3) {
      prompt = `Ты злой комментатор дартса в грубом стиле. Игрок ${gameState.player} закрыл счёт и занял ${gameState.place}-е место. Гноби, но упомяни везение. ${formatTemplate(getRandomElement(topPlaceTemplates), replacements)} 2-3 предложения, до 60 символов.`;
    } else if (isFinished) {
      prompt = `Ты жёсткий комментатор дартса. Игрок ${gameState.player} закрыл счёт. Гноби, но отметь финиш. ${formatTemplate(getRandomElement(finishTemplates), replacements)} 2-3 предложения, до 60 символов.`;
    } else {
      switch (vibe) {
        case 'angry':
          if (gameState.totalScore === 0) {
            prompt = `Ты яростный комментатор дартса в уличном стиле. Игрок ${gameState.player} набрал 0 очков, полное дно! ${formatTemplate(getRandomElement(ultraLowScoreTemplates), replacements)} Выскажи стыд за этого лоха. 2-3 предложения, до 60 символов.`;
          } else {
            const { message, template } = getScoreMessage(gameState.totalScore, gameState.newScore);
            prompt = `Ты грубый комментатор дартса. Игрок ${insult} ${gameState.player} набрал ${gameState.totalScore}, осталось ${gameState.newScore}. ${formatTemplate(getRandomElement(template), replacements)}, ${message} 2-3 предложения, до 60 символов.`;
          }
          break;
        case 'friendly':
          prompt = `Ты дружелюбный комментатор дартса. Игрок ${gameState.player} набрал ${gameState.totalScore} очков (макс. 180). Осталось ${gameState.newScore}. - <30: мягко подбодри, без мата. - 30-50: похвали за усилие. - 50-160: хвали с энтузиазмом. - >160: восхищайся, как легендой. До 60 символов. Emoji.`;
          break;
        case 'pity':
          prompt = `Ты жалостливый комментатор дартса. Игрок ${gameState.player} набрал ${gameState.totalScore} очков (макс. 180). Осталось ${gameState.newScore}. - <30: пожалей, успокой. - 30-50: посочувствуй, подбодри. - 50-160: похвали с сочувствием. - >160: восхищайся с теплотой. До 60 символов. Emoji.`;
          break;
        default:
          prompt = 'Всё проебал, дебил!';
      }
    }

    prompt =  prompt + ' /no_think';
    console.log(prompt)
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3:8b',
        prompt,
        max_tokens: 60,
        temperature: 0.8,
        top_k: 0,
        top_p: 0.9,
        repeat_penalty: 1.5,
        stream: false,
      }),
    });
    const data = await response.json();
    return data.response?.replace(/<think>|<\/think>/g, '')?.trim() || 'Блять, нейронка сдохла, но ты лох!';
  } catch (error) {
    console.error('Ошибка API:', error);
    return 'Блять, нейронка сдохла, но ты всё равно лох!';
  }
};