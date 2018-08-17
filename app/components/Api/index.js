// @flow
import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import ccxt from 'ccxt';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
// import Select from 'react-select';
// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
// import Refresh from '@material-ui/icons/Refresh';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';

import TYPE from '../../common/enum'
import styles from './Api.css';
// import { getRates } from '../../helper/google-sheet';
// import { formatNumberNew2 } from '../../helper/functionUtils';

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

const getListExchanges = () => {
  const exchanges = ccxt.exchanges || [];
  return exchanges.map(suggestion => ({
    value: suggestion,
    label: suggestion
  }));
};

class Api extends Component<Props> {
  constructor(props) {
    super(props)
    this.dataSave = {};
    this.state = {
      isLoading: true,
      secret: '',
      api: '',
      secret2: '',
      api2: '',
      exchanges: getListExchanges(),
      exchange: 'binance'
    }
    this.bar = '';
  }


  componentDidMount() {
    this.loadData();
  }

  loadData() {
    const dataFromLocalStorage = localStorage.getItem(TYPE.LOCAL_STORAGE_KEY.API);
    let obj = {
      defaultExchange: 'binance'
    };
    if (dataFromLocalStorage) {
      obj = JSON.parse(dataFromLocalStorage);
    }
    this.dataSave = obj;
    const exchange = obj.defaultExchange || 'binance';
    const objTemp = obj[exchange] || {};
    this.setState({
      exchange,
      api: obj.api || '',
      secret: obj.secret || '',
      api2: objTemp.api || '',
      secret2: objTemp.secret || '',
      isLoading: false
    });
  }

  saveData() {
    localStorage.setItem(TYPE.LOCAL_STORAGE_KEY.API, JSON.stringify(this.dataSave));
  }
  handleChangeExchange = event => {
    const exchange = event.target.value;
    const objTemp = this.dataSave[exchange] || {};
    this.setState({
      exchange,
      secret2: objTemp.secret || '',
      api2: objTemp.api || ''
    }, () => {
      this.dataSave.defaultExchange = exchange;
    });
  }

  handleChange = name => event => {
    const { value } = event.target;
    this.setState({
      [name]: value,
    }, () => {
      if (name === 'api2' || name === 'secret2') {
        const obj = this.dataSave[this.state.exchange] || {};
        if (name === 'api2') {
          obj.api = value;
        }
        if (name === 'secret2') {
          obj.secret = value;
        }
        this.dataSave[this.state.exchange] = obj;
      } else {
        if (name === 'api') {
          this.dataSave.api = value;
        }
        if (name === 'secret') {
          this.dataSave.secret = value;
        }
      }
    });
  };

  loadGoogleSheet = async () => {
    this.setState({
      isLoading: true
    }, async () => {
      if (this.state.link) {
        // const res = await getRates(this.state.link);
        this.setState({
          isLoading: false
        })
      } else {
        this.setState({
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
        <div>DIGINET</div>
        <Divider />
        <TextField
          label="API Key"
          value={this.state.api}
          onChange={this.handleChange('api')}
          className={classes.textFieldLarge}
          margin="normal"
        />
        <TextField
          label="Secret key"
          value={this.state.secret}
          onChange={this.handleChange('secret')}
          className={classes.textFieldLarge}
          margin="normal"
        />
        <div>CHON SAN GIAO DICH 2</div>
        <Divider />
        {/* <Select
          options={this.state.exchanges}
          value={this.state.exchange}
          placeholder="Search..."
        /> */}
        <TextField
          select
          label="Sàn"
          className={classes.textField}
          value={this.state.exchange}
          onChange={this.handleChangeExchange.bind(this)}
          SelectProps={{
            MenuProps: {
              className: classes.menu,
            },
          }}
          helperText=""
          margin="normal"
        >
          {this.state.exchanges.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label={`API key (${this.state.exchange})`}
          value={this.state.api2}
          onChange={this.handleChange('api2')}
          className={classes.textFieldLarge}
          margin="normal"
        />
        <TextField
          label={`Secret key (${this.state.exchange})`}
          value={this.state.secret2}
          onChange={this.handleChange('secret2')}
          className={classes.textFieldLarge}
          margin="normal"
        />
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
export default withStyles(styles1)(Api);
