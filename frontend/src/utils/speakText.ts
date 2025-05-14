export const speakText = (text: string, voiceName?: string) => {
  const synth = window.speechSynthesis;

  // Функция для удаления эмодзи из текста
  const removeEmojis = (input: string): string => {
    // Регулярка для удаления эмодзи (Unicode-символы)
    return input.replace(/[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier_Base}\p{Emoji_Component}]/gu, '').trim();
  };

  // Чистим текст от эмодзи
  const cleanedText = removeEmojis(text);
  
  // Если текст после очистки пустой, не говорим ничего
  if (!cleanedText) {
    return;
  }

  const utter = new SpeechSynthesisUtterance(cleanedText);

  // Ищем голос по имени, если задан
  if (voiceName) {
    const voices = synth.getVoices();
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      utter.voice = voice;
    }
  }

  utter.lang = 'ru-RU'; // Можно заменить на 'en-US' если надо
  utter.rate = 1;       // Скорость речи
  utter.pitch = 1;      // Тон
  utter.volume = 1;     // Громкость

  synth.speak(utter);
};