import './layout.less';
import React from 'react';
import Dashboard from '../component/Dashboard';
import Nav from '../component/Nav';
import Menu from '../component/Menu';
import { Select } from 'antd';
const Option = Select.Option;

export default class App extends React.Component {
  render() {
    return (
      <div id="app">
        <Nav/>
        <Dashboard/>
        <Menu/>
      </div>
    );
  }
}
