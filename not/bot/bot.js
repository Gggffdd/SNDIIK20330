const { Telegraf, Markup } = require('telegraf');
const express = require('express');

const BOT_TOKEN = '8579547514:AAFJQR6CL_Ui2Q8-Ac0g_y4vBtwrR4tXraU';
const MINI_APP_URL = 'https://your-vercel-url.vercel.app'; // Замените на ваш URL

const bot = new Telegraf(BOT_TOKEN);
const app = express();

// Порт для Vercel
const PORT = process.env.PORT || 3000;

// Промежуточное ПО для парсинга JSON
app.use(express.json());

// Хранилище данных пользователей (в реальном приложении используйте базу данных)
const userData = new Map();

// Команда /start
bot.start((ctx) => {
  const welcomeText = `🚀 **Добро пожаловать в CryptoWallet!**\n\n` +
    `Ваш надежный цифровой кошелек для управления криптовалютой.\n\n` +
    `📱 **Основные функции:**\n` +
    `• Баланс и портфель\n` +
    ` • Переводы между пользователями\n` +
    `• История транзакций\n` +
    `• Курсы криптовалют\n` +
    `• Безопасное хранение\n\n` +
    `Нажмите кнопку ниже, чтобы открыть кошелек 👇`;

  ctx.reply(welcomeText, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('📱 Открыть CryptoWallet', MINI_APP_URL)],
      [Markup.button.callback('📊 Мой баланс', 'balance'), Markup.button.callback('🔄 История', 'history')],
      [Markup.button.callback('ℹ️ Помощь', 'help')]
    ])
  });
});

// Команда /wallet
bot.command('wallet', (ctx) => {
  ctx.reply('Откройте ваш крипто-кошелек:', {
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Открыть CryptoWallet', MINI_APP_URL)]
    ])
  });
});

// Обработка callback запросов
bot.action('balance', async (ctx) => {
  const userId = ctx.from.id;
  const user = getUserData(userId);
  
  await ctx.answerCbQuery();
  ctx.reply(`💰 **Ваш баланс:**\n\n` +
    `BTC: ${user.balance.BTC.toFixed(8)}\n` +
    `ETH: ${user.balance.ETH.toFixed(6)}\n` +
    `USDT: ${user.balance.USDT.toFixed(2)}\n\n` +
    `💵 **Общий баланс:** $${user.totalBalance.toFixed(2)}`, {
    parse_mode: 'Markdown'
  });
});

bot.action('history', async (ctx) => {
  const userId = ctx.from.id;
  const user = getUserData(userId);
  
  await ctx.answerCbQuery();
  
  const lastTransactions = user.transactions.slice(-3);
  let historyText = `📋 **Последние транзакции:**\n\n`;
  
  lastTransactions.forEach((tx, index) => {
    historyText += `${index + 1}. ${tx.type === 'send' ? '➡️ Отправлено' : '⬅️ Получено'} ${tx.amount} ${tx.currency}\n`;
    historyText += `   💡 ${tx.hash}\n`;
    historyText += `   📅 ${new Date(tx.timestamp).toLocaleDateString()}\n\n`;
  });
  
  ctx.reply(historyText, {
    parse_mode: 'Markdown'
  });
});

bot.action('help', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply(`❓ **Помощь по CryptoWallet**\n\n` +
    `**Как пользоваться:**\n` +
    `• Нажмите "Открыть CryptoWallet" для доступа к кошельку\n` +
    `• Просматривайте баланс во вкладке "Портфель"\n` +
    `• Отправляйте криптовалюту через "Отправить"\n` +
    `• Следите за транзакциями в "Истории"\n\n` +
    `⚠️ **Внимание:** Это демо-версия с тестовыми данными.`, {
    parse_mode: 'Markdown'
  });
});

// Функция для получения данных пользователя
function getUserData(userId) {
  if (!userData.has(userId)) {
    userData.set(userId, {
      balance: {
        BTC: 0.054321,
        ETH: 1.23456,
        USDT: 1250.75
      },
      totalBalance: 4850.25,
      transactions: [
        {
          type: 'receive',
          amount: 0.012345,
          currency: 'BTC',
          hash: '0xa1b2c3d4...',
          timestamp: Date.now() - 86400000
        },
        {
          type: 'send',
          amount: 0.005432,
          currency: 'BTC',
          hash: '0xe5f6g7h8...',
          timestamp: Date.now() - 172800000
        }
      ]
    });
  }
  return userData.get(userId);
}

// Маршрут для вебхуков (если нужно)
app.post('/webhook', (req, res) => {
  // Обработка вебхуков
  res.status(200).send('OK');
});

// Запуск бота
bot.launch().then(() => {
  console.log('🤖 Crypto Bot запущен!');
});

// Обработка graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Запуск Express сервера для Vercel
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});

// Экспорт для Vercel
module.exports = app;
