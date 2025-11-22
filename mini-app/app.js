class CryptoWallet {
    constructor() {
        this.userData = null;
        this.isBalanceVisible = true;
        this.init();
    }

    init() {
        this.initializeTelegramWebApp();
        this.loadUserData();
        this.setupEventListeners();
        this.renderPortfolio();
        this.renderTransactions();
    }

    initializeTelegramWebApp() {
        try {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
            
            const user = Telegram.WebApp.initDataUnsafe?.user;
            if (user) {
                document.getElementById('userId').textContent = `ID: ${user.id}`;
            }
            
            Telegram.WebApp.setHeaderColor('#667eea');
            Telegram.WebApp.setBackgroundColor('#f8fafc');
            
        } catch (error) {
            console.log('Running outside Telegram environment');
            document.getElementById('userId').textContent = 'ID: 123456789';
        }
    }

    loadUserData() {
        // В реальном приложении здесь был бы запрос к API
        this.userData = {
            balance: {
                BTC: 0.054321,
                ETH: 1.23456,
                USDT: 1250.75
            },
            totalBalance: 4850.25,
            portfolio: [
                {
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    amount: 0.054321,
                    value: 3245.25,
                    change: 2.5,
                    icon: '₿'
                },
                {
                    symbol: 'ETH',
                    name: 'Ethereum',
                    amount: 1.23456,
                    value: 1250.50,
                    change: -1.2,
                    icon: 'Ξ'
                },
                {
                    symbol: 'USDT',
                    name: 'Tether',
                    amount: 1250.75,
                    value: 1250.75,
                    change: 0.1,
                    icon: '💵'
                }
            ],
            transactions: [
                {
                    type: 'receive',
                    amount: 0.012345,
                    currency: 'BTC',
                    hash: '0xa1b2c3d4e5f678901234567890abcdef',
                    timestamp: Date.now() - 86400000,
                    from: '0x742d35Cc6634C0532925a3b8Dc9F'
                },
                {
                    type: 'send',
                    amount: 0.005432,
                    currency: 'BTC',
                    hash: '0xe5f6g7h8i9j01234567890klmnopqr',
                    timestamp: Date.now() - 172800000,
                    to: '0x8932d35Cc6634C0532925a3b8Dc9F'
                },
                {
                    type: 'receive',
                    amount: 2.5,
                    currency: 'ETH',
                    hash: '0xstuvwxyz0123456789abcdefghijkl',
                    timestamp: Date.now() - 259200000,
                    from: '0x9564d35Cc6634C0532925a3b8Dc9F'
                }
            ]
        };
    }

    setupEventListeners() {
        // Toggle balance visibility
        document.getElementById('toggleBalance').addEventListener('click', () => {
            this.toggleBalanceVisibility();
        });

        // Action buttons
        document.getElementById('btnSend').addEventListener('click', () => {
            this.openSendModal();
        });

        document.getElementById('btnReceive').addEventListener('click', () => {
            this.openReceiveModal();
        });

        document.getElementById('btnSwap').addEventListener('click', () => {
            this.showNotification('Функция обмена скоро будет доступна!');
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // Modal controls
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Send modal
        document.getElementById('confirmSend').addEventListener('click', () => {
            this.confirmSend();
        });

        // Copy address
        document.getElementById('copyAddress').addEventListener('click', () => {
            this.copyToClipboard('walletAddress');
        });

        // View all transactions
        document.getElementById('viewAllTransactions').addEventListener('click', () => {
            this.showAllTransactions();
        });

        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });
    }

    toggleBalanceVisibility() {
        this.isBalanceVisible = !this.isBalanceVisible;
        const balanceElement = document.getElementById('totalBalance');
        const eyeIcon = document.querySelector('.eye-icon');
        
        if (this.isBalanceVisible) {
            balanceElement.textContent = `$${this.userData.totalBalance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
            eyeIcon.textContent = '👁️';
        } else {
            balanceElement.textContent = '••••••';
            eyeIcon.textContent = '🙈';
        }
    }

    openSendModal() {
        document.getElementById('sendModal').classList.add('show');
    }

    openReceiveModal() {
        this.generateWalletAddress();
        document.getElementById('receiveModal').classList.add('show');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    generateWalletAddress() {
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 40; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        document.getElementById('walletAddress').textContent = address;
    }

    copyToClipboard(elementId) {
        const text = document.getElementById(elementId).textContent;
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Адрес скопирован в буфер обмена!');
        });
    }

    confirmSend() {
        const currency = document.getElementById('sendCurrency').value;
        const amount = parseFloat(document.getElementById('sendAmount').value);
        const address = document.getElementById('recipientAddress').value;

        if (!amount || amount <= 0) {
            this.showNotification('Введите корректную сумму');
            return;
        }

        if (!address || address.length < 10) {
            this.showNotification('Введите корректный адрес получателя');
            return;
        }

        // Проверка баланса
        if (amount > this.userData.balance[currency]) {
            this.showNotification('Недостаточно средств');
            return;
        }

        // Симуляция отправки
        this.simulateTransaction(currency, amount, address);
    }

    simulateTransaction(currency, amount, address) {
        this.showNotification(`Отправка ${amount} ${currency}...`, 'info');
        
        setTimeout(() => {
            // Обновление баланса
            this.userData.balance[currency] -= amount;
            
            // Добавление транзакции
            this.userData.transactions.unshift({
                type: 'send',
                amount: amount,
                currency: currency,
                hash: '0x' + Math.random().toString(16).substr(2, 40),
                timestamp: Date.now(),
                to: address
            });

            this.closeAllModals();
            this.renderPortfolio();
            this.renderTransactions();
            this.showNotification(`Успешно отправлено ${amount} ${currency}!`);
        }, 2000);
    }

    renderPortfolio() {
        const container = document.querySelector('.assets-list');
        container.innerHTML = '';

        this.userData.portfolio.forEach(asset => {
            const element = document.createElement('div');
            element.className = 'asset-item';
            element.innerHTML = `
                <div class="asset-icon ${asset.symbol.toLowerCase()}">
                    ${asset.icon}
                </div>
                <div class="asset-info">
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-amount">${asset.amount} ${asset.symbol}</div>
                </div>
                <div class="asset-value">
                    <div class="asset-price">$${asset.value.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}</div>
                    <div class="asset-change ${asset.change >= 0 ? 'positive' : 'negative'}">
                        ${asset.change >= 0 ? '+' : ''}${asset.change}%
                    </div>
                </div>
            `;
            container.appendChild(element);
        });
    }

    renderTransactions() {
        const container = document.querySelector('.transactions-list');
        container.innerHTML = '';

        const recentTransactions = this.userData.transactions.slice(0, 5);

        recentTransactions.forEach(transaction => {
            const element = document.createElement('div');
            element.className = 'transaction-item';
            
            const isSend = transaction.type === 'send';
            const icon = isSend ? '➡️' : '⬅️';
            const typeText = isSend ? 'Отправлено' : 'Получено';
            const amountClass = isSend ? 'negative' : 'positive';
            const amountPrefix = isSend ? '-' : '+';

            element.innerHTML = `
                <div class="transaction-icon">
                    ${icon}
                </div>
                <div class="transaction-details">
                    <div class="transaction-type">${typeText}</div>
                    <div class="transaction-hash">${transaction.hash.substring(0, 16)}...</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    <div>${amountPrefix}${transaction.amount} ${transaction.currency}</div>
                    <div class="transaction-date">${new Date(transaction.timestamp).toLocaleDateString()}</div>
                </div>
            `;
            container.appendChild(element);
        });
    }

    switchTab(tabName) {
        // Обновление активной навигации
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Здесь можно добавить логику переключения контента
        this.showNotification(`Переключено на вкладку: ${this.getTabName(tabName)}`);
    }

    getTabName(tabKey) {
        const tabs = {
            portfolio: 'Портфель',
            market: 'Рынок',
            swap: 'Обмен',
            history: 'История'
        };
        return tabs[tabKey] || tabKey;
    }

    showAllTransactions() {
        this.showNotification('Загрузка полной истории транзакций...');
        // В реальном приложении здесь была бы загрузка полной истории
    }

    showNotification(message, type = 'success') {
        // Создание временного уведомления
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : type === 'info' ? '#3b82f6' : '#ef4444'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1001;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Инициализация приложения когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    new CryptoWallet();
});

// Обработка ошибок
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
});
