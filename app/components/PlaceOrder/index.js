// @flow
import React, { Component } from 'react';
// import TextField from '@material-ui/core/TextField';
// import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from '@material-ui/core/TableRow';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
// import Divider from '@material-ui/core/Divider';
// import AppBar from '@material-ui/core/AppBar';

// import Refresh from '@material-ui/icons/Refresh';
import CircularProgress from '@material-ui/core/CircularProgress';
import { getRates } from '../../helper/google-sheet';
import TYPE from '../../common/enum'
import styles from './PlaceOrder.css';
import { getMarketWarper, loadMarket, getDepths, placeOrder, fetchOrders, getBalance } from '../../helper/cctx';
import logger from '../../helper/logger';
import { formatNumberNew2 } from '../../helper/functionUtils';

// import { getRates } from '../../helper/google-sheet';
// import { formatNumberNew2 } from '../../helper/functionUtils';

// import TYPE from '../../common/enum'

const LIMIT = {
  currency: 500000000,
  percentCoin: 70,
  maxBtc: 3,
  maxEth: 20
}

const styles1 = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '45%',
  },
  textFieldLarge: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '75%',
  },
  textFieldFull: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '100%',
  },

  menu: {
    width: '20%',
  },
  button: {
    margin: theme.spacing.unit,
  },
  divider: {
    height: '40px',
    width: '100%',
    border: '1px solid blue',
    lineHeight: '40px',
    backgroundColor: 'blue',
    marginTop: '32px',
    marginBottom: '16px',
    color: 'white',
    verticalAlign: 'middle'
  },
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    width: '45%',
    minWidth: '100px',
  },
});

class PlaceOrder extends Component<Props> {
  constructor(props) {
    super(props)
    this.settingGeneral = null;
    this.settingApi = null;
    this.main = null;
    this.exchange = null;
    this.depthMain = {};
    this.depthExchange = {};
    this.preOrders = {};
    this.rate = {};
    this.state = {
      isLoading: true,
      state: 'STOPPED',
      timeStart: null,
      btc1: '',
      eth1: '',
      vnd: '',
      btc2: '',
      eth2: '',
      usd: '',
      usdt: '',
      tusd: ''
    }
    this.bar = '';
  }

  componentDidMount() {
    this.loadData();
    // setInterval(() => {
    this.getBalance()
    // }, 3000)
  }

  async getBalance() {
    // const balanceMain = await getBalance(this.main) || {};
    const balanceOpposite = await getBalance(this.exchange) || {};
    // console.log('blance: ', balanceMain);
    logger.info('blance: ', balanceOpposite);
    this.setState({
      // btc1: formatNumberNew2(balanceMain.btc),
      // eth1: formatNumberNew2(balanceMain.btc),
      // vnd: formatNumberNew2(balanceMain.btc),
      btc2: formatNumberNew2(balanceOpposite.btc),
      eth2: formatNumberNew2(balanceOpposite.btc),
      usd: formatNumberNew2(balanceOpposite.btc),
      usdt: formatNumberNew2(balanceOpposite.btc),
      tusd: formatNumberNew2(balanceOpposite.btc),
    })
  }
  stop() {
    this.setState({
      timeStart: null,
      state: 'STOPPED'
    })
  }

  loadData() {

    const dataFromLocalStorage = localStorage.getItem(TYPE.LOCAL_STORAGE_KEY.GENERAL);
    let obj = {
      currency: 'BTC',
      interval: 5,
      intervalOrder: 1,
      maxSize: 30,
      maxTime: 2,
      depthNumber: 5,
      link: '',
      rate: 23000,
      currencyRelated: 'USD'
    };
    if (dataFromLocalStorage) {
      obj = JSON.parse(dataFromLocalStorage);
    }
    this.settingGeneral = obj;

    const dataApi = localStorage.getItem(TYPE.LOCAL_STORAGE_KEY.API);
    let objApi = {
      defaultExchange: 'binance'
    };
    if (dataApi) {
      objApi = JSON.parse(dataApi);
    }
    this.settingApi = objApi;
    const oppositeApi = objApi[this.settingApi.defaultExchange] || {};
    this.main = getMarketWarper(TYPE.EXCHANGE.MAIN, objApi.api, objApi.secret);
    // this.main.headers = {
    //   'Access-Control-Allow-Origin': '*',
    //   'Origin': '*'
    // }
    this.exchange = getMarketWarper(this.settingApi.defaultExchange, oppositeApi.api, oppositeApi.secret);
    // this.exchange.headers = {
    //   'Access-Control-Allow-Origin': '*',
    //   'Origin': '*'
    // }
    this.setState({
      isLoading: false
    })
  }




  async checkStartOrder() {
    if (!this.main || !this.exchange) return false;
    if (!this.settingApi || !this.settingGeneral) return false;
    await loadMarket(this.main);
    await loadMarket(this.exchange);
    return true;
  }

  async getDepthsMain() {
    const checkMain = await loadMarket(this.main);
    if (!checkMain) {
      logger.warn(`STOP with reason: can not connect to main exchange`);
      return;
    }
    this.depthMain = await getDepths(this.main, `${this.settingGeneral.currency}/USDT`, this.settingGeneral.depthNumber);
    logger.info('this.depthMain')
    logger.info(this.depthMain)
  }

  async getDepths() {
    await this.getDepthsMain();
    await this.getDepthsOpposite();
  }
  async getDepthsOpposite() {
    const checkExchange = await loadMarket(this.exchange);
    if (!checkExchange) {
      logger.warn(`STOP with reason: can not connect to exchange: ${this.settingApi.defaultExchange}`);
      return;
    }
    this.depthExchange = await getDepths(this.exchange, `${this.settingGeneral.currency}/USDT`, this.settingGeneral.depthNumber);
    logger.info('this.depthExchange')
    logger.info(this.depthExchange)
  }

  async getRate() {
    const rateObj = await getRates(this.settingGeneral.rate) || {};
    this.rate = rateObj.data && rateObj.data.length ? rateObj.data[rateObj.data.length - 1] : {};
  }
  makeOrders(list, side) {
    const listReturn = [];
    for (let q = 0; q < list.length; q += 1) {
      const element = list[q];
      const objTemp = {
        code: this.settingGeneral.currency,
        quantity: this.caculatorSize(element.amount, this.settingGeneral.maxSize),
        price: side === 'bid' ? this.caculatorPrice(element.ask, this.settingGeneral.rate, this.settingGeneral.currencyRelated, 'ask') : this.caculatorPrice(element.bid, this.settingGeneral.rate, this.settingGeneral.currencyRelated, 'bid'),
        side: side === 'bid' ? 'ask' : 'bid'
      };

      listReturn.push(objTemp);
    }
  }
  async doOrders() {
    this.setState({
      timeStart: new Date().toString(),
      state: 'RUNNING'
    })
    await this.getRate();

    const isOk = await this.checkStartOrder();
    if (!isOk) {
      return;
    }
    await this.getDepths();

    const listBids = this.depthExchange ? this.depthExchange.bids || [] : [];
    const listAsks = this.depthExchange ? this.depthExchange.asks || [] : [];

    const listOrdersAsk = this.makeOrders(listBids, 'bid');
    const listOrdersBid = this.makeOrders(listAsks, 'ask');


    const listPromisse = [];
    for (let y = 0; y < listOrdersAsk.length; y += 1) {
      const askObj = listOrdersAsk[y];
      listPromisse.push(placeOrder(this.main, askObj.code, 'limit', askObj.side, askObj.quantity, askObj.price));
    }

    for (let y = 0; y < listOrdersBid.length; y += 1) {
      const bidObj = listOrdersBid[y];
      listPromisse.push(placeOrder(this.main, bidObj.code, 'limit', bidObj.side, bidObj.quantity, bidObj.price));
    }
    Promise.all(listPromisse).then(() => {
      logger.info('ALL ORDERS WAS SENT');
      return true;
    }).catch(err => {
      logger.info(`ORDER SEND ERROR: ${err}`);
    });
  }

  makeOrder(quantity, price, side) {
    return {
      code: this.settingGeneral.currency,
      quantity,
      price,
      side
    };
  }
  async makeOrdesrOpposite(limit = 4) {
    const listOrders = await fetchOrders(this.main, this.settingGeneral.currency, limit);
    // await this.getDepthsOpposite();
    let totalQuantityBid = 0;
    let totalQuantityAsk = 0;
    for (let u = 0; u < listOrders.length; u += 1) {
      const element = listOrders[u];
      if (element.filledQuantity) {
        const oldOrder = this.preOrders[element.orderId] || {};
        const diffQuantity = element.filledQuantity - (oldOrder.filledQuantity || 0);
        if (element.side === 'bid') {
          totalQuantityAsk += diffQuantity;
        } else {
          totalQuantityBid += diffQuantity;
        }
      }
      this.preOrders[element.orderId] = element;
    }
    const listBids = this.depthExchange ? this.depthExchange.bids || [] : [];
    const listAsks = this.depthExchange ? this.depthExchange.asks || [] : [];
    const listOrdersBid = this.createListOrders(listBids, totalQuantityBid);
    const listOrdersAsk = this.createListOrders(listAsks, totalQuantityAsk);
    const listOrdersReturn = [...listOrdersBid, ...listOrdersAsk];
    const listPromisse = [];
    for (let y = 0; y < listOrdersReturn.length; y += 1) {
      const objTemp = listOrdersReturn[y];
      listPromisse.push(placeOrder(this.exchange, objTemp.code, 'limit', objTemp.side, objTemp.quantity, objTemp.price));
    }

    Promise.all(listPromisse).then(() => {
      logger.info('ALL ORDERS WAS SENT TO EXCHANGE OPPOSITE');
      return true;
    }).catch(err => {
      logger.info(`ORDER SEND ERROR: ${err}`);
    });

  }

  createListOrders(listDepths, totalQuantity) {
    let totalQuantityDeal = totalQuantity;
    const listReturn = [];
    for (let t = 0; t < listDepths.length; t += 1) {
      const bidDepth = listDepths[t];
      if (bidDepth.quantity > totalQuantityDeal) {
        listReturn.push(this.makeOrder(totalQuantityDeal, bidDepth.price, 'bid'));
        break;
      } else {
        listReturn.push(this.makeOrder(bidDepth.quantity, bidDepth.price, 'bid'));
        totalQuantityDeal -= bidDepth.quantity;
      }
    }
    return listReturn;
  }

  caculatorPrice(price, rate, currencyRate, side) {
    return side === 'bid' ? (price + rate) * currencyRate : (price - rate) * currencyRate;
  }
  caculatorSize(volume, percentConfig = 30) {
    return Math.round(volume * percentConfig / 100);
  }

  render() {
    const { classes } = this.props;
    if (this.state.isLoading) {
      return (
        <div className={styles.rootBusyBox}>
          <CircularProgress className={classes.progress} />
        </div>
      );
    }
    return (
      <div className={styles.rootMenu}>
        <Button variant="contained" color="primary" className={classes.button} onClick={this.doOrders.bind(this)}>
          Start
        </Button>
        <Button variant="contained" color="secondary" className={classes.button} onClick={this.stop.bind(this)}>
          Stop
        </Button>
        <Paper className={classes.root} elevation={1}>
          <Typography variant="headline" component="h3">
            {this.state.state}
          </Typography>
          <Typography component="p">
            {this.state.timeStart ? this.state.timeStart : '--'}
          </Typography>
        </Paper>
        <div className={classes.divider}>EXCHANGE DIGINET</div>
        <FormControl className={classes.textField}>
          <InputLabel htmlFor="adornment-amount">BTC</InputLabel>
          <Input
            value={this.state.btc1}
            startAdornment={<InputAdornment position="start">฿</InputAdornment>}
          />
        </FormControl>
        <FormControl className={classes.textField}>
          <InputLabel htmlFor="adornment-amount">ETH</InputLabel>
          <Input
            value={this.state.eth1}
            startAdornment={<InputAdornment position="start">€</InputAdornment>}
          />
        </FormControl>
        <FormControl className={classes.textField}>
          <InputLabel htmlFor="adornment-amount">VND</InputLabel>
          <Input
            value={this.state.vnd}
            startAdornment={<InputAdornment position="start">Đ</InputAdornment>}
          />
        </FormControl>
        <div className={classes.divider}>EXCHANGE OPPOSITE</div>
        <FormControl className={classes.textField}>
          <InputLabel htmlFor="adornment-amount">BTC</InputLabel>
          <Input
            value={this.state.btc2}
            startAdornment={<InputAdornment position="start">฿</InputAdornment>}
          />
        </FormControl>
        <FormControl className={classes.textField}>
          <InputLabel htmlFor="adornment-amount">ETH</InputLabel>
          <Input
            value={this.state.eth2}
            startAdornment={<InputAdornment position="start">€</InputAdornment>}
          />
        </FormControl>
        <FormControl className={classes.textField}>
          <InputLabel htmlFor="adornment-amount">USD</InputLabel>
          <Input
            value={this.state.usd}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
          />
        </FormControl>
        <FormControl className={classes.textField}>
          <InputLabel htmlFor="adornment-amount">USDT</InputLabel>
          <Input
            value={this.state.usdt}
            startAdornment={<InputAdornment position="start">$T</InputAdornment>}
          />
        </FormControl>
        <FormControl className={classes.textField}>
          <InputLabel htmlFor="adornment-amount">TUSD</InputLabel>
          <Input
            value={this.state.tusd}
            startAdornment={<InputAdornment position="start">T$</InputAdornment>}
          />
        </FormControl>
      </div>
    );
  }
}
export default withStyles(styles1)(PlaceOrder);
