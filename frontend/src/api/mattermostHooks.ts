export const sendToMattermost = async (message: string): Promise<void> => {
  const backendUrl = 'http://localhost:8080/send-to-mattermost'; // На проде замени на твой бэкенд-URL

  console.log('Отправляем в бэкенд:', { backendUrl, message });

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка от бэкенда:', response.status, errorText);
      throw new Error(`Ошибка отправки: ${response.status} ${errorText}`);
    }
    console.log('Сообщение отправлено через бэкенд, молодец, не обосрался!');
  } catch (error) {
    console.error('Пиздец, не смог отправить через бэкенд:', error);
    throw error;
  }
};