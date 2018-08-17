import ccxt from 'ccxt';
import logger from './logger';

export function getMarketWarper(Name, api, secret) {
    if (!Name) return null;
    return new ccxt[Name]({
        'enableRateLimit': true,
        'apiKey': api,
        'secret': secret,
        // 'proxy': 'https://cors-anywhere.herokuapp.com/'
    });
}
export function listExchange() {
    return ccxt.exchanges;
}
export async function getBalance(market) {
    return await market.fetchBalance();
}

export async function getDepths(market, symbol, limit) {
    const listOrderBook = await market.fetchOrderBook(symbol, limit);
    return listOrderBook;
}

export async function placeOrder(market, symbol, type, side, amount, price = undefined) {
    // market.createOrder(symbol, type, side, amount, price)
}

export async function fetchOrders(market, symbol, limit) {
    return await market.fetchOrders(symbol, undefined, limit);
}

export async function loadMarket(market) {
    try {
        await market.loadMarkets();
        return true;
    } catch (e) {
        let emsg = '';
        if (e instanceof ccxt.DDoSProtection || e.message.includes('ECONNRESET')) {
            emsg = `[DDoS Protection Error]  ${e.message}`;
        } else if (e instanceof ccxt.RequestTimeout) {
            emsg = `[Timeout Error]   ${e.message}`;
        } else if (e instanceof ccxt.AuthenticationError) {
            emsg = `[Authentication Error] ${e.message}`;
        } else if (e instanceof ccxt.ExchangeNotAvailable) {
            emsg = `[Exchange Not Available Error] ${e.message}`;
        } else if (e instanceof ccxt.ExchangeError) {
            emsg = `[Exchange Error] ${e.message}`;
        } else {
            emsg = e.message;
        }
        logger.error(`Lỗi kết nối sàn:  ${emsg}`);
    }
    return false;
}