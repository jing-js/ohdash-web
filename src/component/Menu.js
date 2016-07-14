import React from 'react';
import { Icon } from 'antd';
import dashboard from '../struct/Dashboard';
import './menu.less';

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.dashboard = dashboard;
    this.state = {
      expand: true
    }
  }
  expandMenu(expand) {
    this.setState({
      expand
    });
  }
  addPanel(PanelClass) {
    this.dashboard.addPanel(new PanelClass(this.dashboard));
  }
  render() {
    return (
      <div className={"menu" + (this.state.expand ? ' expand' : '')}>
        <div onClick={this.expandMenu.bind(this, !this.state.expand)} className="menu-trigger">
          <Icon type={this.state.expand ? 'right' : 'left'}/>
        </div>
        <div className="menu-inner">
          <h4>添加面板</h4>
          <ul>
            {
              this.dashboard._panelClasses.map(PanelClass => {
                return (
                  <li onClick={this.addPanel.bind(this, PanelClass)} key={PanelClass.name}>
                    <a href="javascript:;">{PanelClass.displayName}</a>
                  </li>
                )
              })
            }
          </ul>
        </div>
      </div>
    )
  }
}