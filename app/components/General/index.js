// @flow
import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Refresh from '@material-ui/icons/Refresh';
import CircularProgress from '@material-ui/core/CircularProgress';

import TYPE from '../../common/enum'
import styles from './General.css';
import { getRates } from '../../helper/google-sheet';
import { formatNumberNew2 } from '../../helper/functionUtils';

// import TYPE from '../../common/enum'

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

class General extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      listRate: [{ bid: 12, ask: 11 }],
      currency: 'BTC',
      interval: 5,
      intervalOrder: 1,
      maxSize: 30,
      maxTime: 2,
      depthNumber: 5,
      link: '',
      rate: 23000,
      currencyRelated: 'USD',
      listCurrency: [{ value: 'BTC', label: 'BTC' }, { value: 'ETH', label: 'ETH' }],
      listRelated: [{ value: ' USDT', label: ' BTC/USDT' }, { value: 'USD', label: 'BTC/USD' }]
    }
    this.bar = '';
  }

  componentDidMount() {
    this.loadData();
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
      currencyRelated: 'USD',
    };
    if (dataFromLocalStorage) {
      obj = JSON.parse(dataFromLocalStorage);
    }
    this.setState({
      currency: obj.currency,
      isLoading: false,
      interval: obj.interval,
      maxSize: obj.maxSize,
      maxTime: obj.maxTime,
      depthNumber: obj.depthNumber,
      link: obj.link,
      rate: obj.rate,
      currencyRelated: obj.currencyRelated
    }, () => {
      this.loadGoogleSheet()
    });
  }

  saveData() {
    const objSave = {
      link: this.state.link,
      currency: this.state.currency,
      interval: this.state.interval,
      intervalOrder: this.state.intervalOrder,
      maxSize: this.state.maxSize,
      maxTime: this.state.maxTime,
      rate: this.state.rate,
      depthNumber: this.state.depthNumber,
      currencyRelated: this.state.currencyRelated
    };
    localStorage.setItem(TYPE.LOCAL_STORAGE_KEY.GENERAL, JSON.stringify(objSave));
  }

  handleChangeCurrency = event => {
    const currency = event.target.value;
    const currencyRelated = 'USD';
    let listRelated = [{ value: 'USDT', label: 'BTC/USDT' }, { value: 'USD', label: 'BTC/USD' }];
    if (currency === 'ETH') {
      listRelated = [{ value: 'USDT', label: 'ETH/USDT' }, { value: 'USD', label: 'ETH/USD' }];
    }
    this.setState({
      currency,
      listRelated,
      currencyRelated
    });
  }
  handleChangeReleated = event => {
    const currencyRelated = event.target.value;
    this.setState({
      currencyRelated
    });
  }
  handleChangeRate = event => {
    const rate = event.target.value;
    this.setState({
      rate
    });
  }
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    }, () => {
      if (name === 'link') {
        this.loadGoogleSheet();
      }
    });
  };
  loadGoogleSheet = async () => {
    this.setState({
      isLoading: true
    }, async () => {
      if (this.state.link) {
        const res = await getRates(this.state.link);
        this.setState({
          listRate: res.data || [],
          isLoading: false
        })
      } else {
        this.setState({
          listRate: [],
          isLoading: false
        })
      }
    })
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
        <TextField
          className={classes.textField}
          value={this.state.maxSize}
          onChange={this.handleChange('maxSize')}
          type="number"
          label="Order Size Max (%)"
          margin="normal"
        />
        <TextField
          className={classes.textField}
          value={this.state.intervalOrder}
          onChange={this.handleChange('intervalOrder')}
          type="number"
          label="Thời gian check Order"
          margin="normal"
        />
        <TextField
          className={classes.textField}
          value={this.state.maxTime}
          onChange={this.handleChange('maxTime')}
          type="number"
          label="Thời gian tối đa"
          margin="normal"
        />
        <TextField
          className={classes.textField}
          value={this.state.interval}
          onChange={this.handleChange('interval')}
          type="number"
          label="Interval (s)"
          margin="normal"
        />
        <TextField
          select
          label="Đồng tiền đối chiếu"
          className={classes.textField}
          value={this.state.currency}
          onChange={this.handleChangeCurrency.bind(this)}
          SelectProps={{
            MenuProps: {
              className: classes.menu,
            },
          }}
          helperText=""
          margin="normal"
        >
          {this.state.listCurrency.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Cặp giao dịch trên sàn 2"
          className={classes.textField}
          value={this.state.currencyRelated}
          onChange={this.handleChangeReleated.bind(this)}
          SelectProps={{
            MenuProps: {
              className: classes.menu,
            },
          }}
          helperText=""
          margin="normal"
        >
          {this.state.listRelated.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Tỷ giá quy đổi"
          type="number"
          value={this.state.rate}
          className={classes.textField}
          onChange={this.handleChangeRate.bind(this)}
          helperText={`1 ${this.state.currencyRelated} = ${formatNumberNew2(this.state.rate)} VND`}
          margin="normal"
        />
        <TextField
          className={classes.textField}
          type="number"
          defaultValue="5"
          value={this.state.depthNumber}
          onChange={this.handleChange('depthNumber')}
          label="Chiều sâu của lệnh"
          margin="normal"
        />
        <TextField
          label="Link google sheet"
          value={this.state.link}
          onChange={this.handleChange('link')}
          className={classes.textFieldLarge}
          margin="normal"
        />
        <Button variant="fab" mini color="secondary" aria-label="Add" className={classes.button} onClick={this.loadGoogleSheet.bind(this)}>
          <Refresh />
        </Button>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell numeric>Bid Rate (%)</TableCell>
              <TableCell numeric>Ask Rate (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.listRate.map(n => {
              const { bid, ask } = n
              return (
                <TableRow key={n.id}>
                  <TableCell numeric>{bid}</TableCell>
                  <TableCell numeric>{ask}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Button variant="contained" color="primary" className={classes.button} onClick={this.saveData.bind(this)}>
          Save
        </Button>
        <Button variant="contained" color="secondary" className={classes.button} onClick={this.loadData.bind(this)}>
          Reset
        </Button>
      </div>
    );
  }
}
export default withStyles(styles1)(General);
