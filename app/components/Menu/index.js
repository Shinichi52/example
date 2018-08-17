// @flow
import React, { Component } from 'react';
import styles from './Menu.css';
import TYPE from '../../common/enum'

type Props = { menuChanged: () => void };

export default class Menu1 extends Component<Props> {
  constructor(props) {
    super(props)
    this.bar = '';
  }
  click2System() {
    this.props.menuChanged(TYPE.MENU.SYSTEM);
  }
  click2General() {
    this.props.menuChanged(TYPE.MENU.GENERAL);
  }
  click2Api() {
    this.props.menuChanged(TYPE.MENU.API);
  }

  render() {
    return (
      <div className={styles.rootMenu}>
        <button className={styles.level1} onClick={this.click2System.bind(this)}>System</button>
        <button className={styles.level1} onClick={this.click2System.bind(this)}>Seting</button>
        <button className={styles.level2} onClick={this.click2General.bind(this)}>General</button>
        <button className={styles.level2} onClick={this.click2Api.bind(this)}>API</button>
      </div>
    );
  }
}
