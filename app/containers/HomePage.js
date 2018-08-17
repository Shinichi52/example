// @flow
import React, { Component } from 'react';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import StarIcon from '@material-ui/icons/Star';
import SendIcon from '@material-ui/icons/Send';

import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as HomeActions from '../actions/home';
import Menu from '../components/Menu';
import General from '../components/General';
import Api from '../components/Api';
import PlaceOrder from '../components/PlaceOrder';
import TYPE from '../common/enum';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  appFrame: {
    zIndex: 1,
    overflow: 'auto',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
  },
  'appBar-left': {
    marginLeft: drawerWidth,
  },
  'appBar-right': {
    marginRight: drawerWidth,
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
  },
});


class HomePage extends Component<Props> {
  menuChanged(menu) {
    this.props.changedMenu(menu);
  }
  getScreen() {
    switch (this.props.home.menu) {
      case TYPE.MENU.SYSTEM:
        return (
          <div>
            <PlaceOrder />
          </div>
        );
      case TYPE.MENU.GENERAL:
        return <General />
      case TYPE.MENU.API:
        return <Api />

      default:
        return null
    }

  }
  render() {
    const anchor = 'left';
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <Drawer
            variant="permanent"
            classes={{
              paper: classes.drawerPaper,
            }}
            anchor={anchor}
          >
            <div className={classes.toolbar} />
            <Divider />
            <List>
              <div>
                <ListItem button onClick={() => this.menuChanged(TYPE.MENU.SYSTEM)}>
                  <ListItemIcon>
                    <InboxIcon />
                  </ListItemIcon>
                  <ListItemText primary="System" />
                </ListItem>
                <ListItem button onClick={() => this.menuChanged(TYPE.MENU.API)}>
                  <ListItemIcon>
                    <StarIcon />
                  </ListItemIcon>
                  <ListItemText primary="API" />
                </ListItem>
                <ListItem button onClick={() => this.menuChanged(TYPE.MENU.GENERAL)}>
                  <ListItemIcon>
                    <SendIcon />
                  </ListItemIcon>
                  <ListItemText primary="General" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <DraftsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Drafts" />
                </ListItem>
              </div>
            </List>
          </Drawer>
          <div className={classes.content}>
            {
              this.getScreen()
            }
          </div>
        </div>
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    home: state.home
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(HomeActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(HomePage));