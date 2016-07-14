import './layout.less';
import React from 'react';
import Dashboard from '../component/Dashboard';
import Nav from '../component/Nav';
import Menu from '../component/Menu';

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
