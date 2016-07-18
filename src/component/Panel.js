import React from 'react';
import { Icon } from 'antd';
import Point from '../struct/Point';
import LayoutItem from '../struct/LayoutItem';
import layoutHelper from '../struct/LayoutHelper';

export default class Panel extends React.Component {
  constructor(props) {
    super(props);

    this._eventTag = {
      isMoving: false,
      isDown: false,
      downPoint: new Point(),
      downPosition: new Point(),
      delta: new Point(),
      moveHandler: null,
      upHandler: null
    };
    
  }
  _onMouseDown(evt) {
    let et = this._eventTag;
    if (et.isDown) {
      this._onMouseUp(); // clear previous mousedown
    }
    et.isDown = true;
    et.downPoint.set(evt.pageX, evt.pageY);
  }
  onMoveDown(evt) {
    this._onMouseDown(evt);
    let et = this._eventTag;
    let panel = this.props.model;
    et.downPosition.set(panel.left, panel.top);
    et.moveHandler = this.onMoveMove.bind(this);
    et.upHandler = this.onMoveUp.bind(this);
    document.addEventListener('mousemove', et.moveHandler);
    document.addEventListener('mouseup', et.upHandler);
  }
  onSizeDown(evt) {
    this._onMouseDown(evt);
    let et = this._eventTag;
    let panel = this.props.model;
    et.downPosition.set(panel.width, panel.height);
    et.moveHandler = this.onSizeMove.bind(this);
    et.upHandler = this.onSizeUp.bind(this);
    document.addEventListener('mousemove', et.moveHandler);
    document.addEventListener('mouseup', et.upHandler);
  }
  _onMouseMove(evt) {
    let et = this._eventTag;
    et.isMoving = true;
    et.delta.set(evt.pageX - et.downPoint.x, evt.pageY - et.downPoint.y);
  }
  onMoveMove(evt) {
    this._onMouseMove(evt);
    let panel = this.props.model;
    let et = this._eventTag;
    layoutHelper.movePanel(panel, evt.metaKey || evt.ctrlKey, et.downPosition.x + et.delta.x, et.downPosition.y + et.delta.y);
    this.setState({});
  }
  onSizeMove(evt) {
    this._onMouseMove(evt);
    let panel = this.props.model;
    let et = this._eventTag;
    layoutHelper.sizePanel(panel, evt.metaKey || evt.ctrlKey, et.downPosition.x + et.delta.x, et.downPosition.y + et.delta.y);
    this.setState({});
  }
  _onMouseUp() {
    let et = this._eventTag;
    document.removeEventListener('mousemove', et.moveHandler);
    document.removeEventListener('mouseup', et.upHandler);
    et.isMoving = false;
    et.isDown = false;
    et.moveHandler = null;
    et.upHandler = null;
    this._afterMove();
  }
  onMoveUp(evt) {
    this._onMouseUp();
    this.setState({});
  }
  onSizeUp(evt) {
    this._onMouseUp();
    this.setState({});
  }
  onSettingDown(evt) {
    this.props.dashboard.editPanel = this.props.model;
    evt.stopPropagation();
  }
  onDeleteDown(evt) {
    this.props.dashboard.removePanel(this.props.model);
    evt.stopPropagation();
  }
  _afterMove() {
    // let panel = this.props.model;
    // let att = panel.layoutAttach;

    layoutHelper.clear();

    // if (att.leftEnable) {
    //   panel.left = att.left;
    // }
    // if (att.topEnable) {
    //   panel.top = att.top;
    // }
    // panel.right = panel.left + panel.width;
    // panel.bottom = panel.top + panel.height;
    // panel.dependents.forEach(dPanel => {
    //   dPanel.layoutState = LayoutItem.LAYOUT_STATE.CALC;
    // });
    // todo layout depentes
  }
  render() {
    let panel = this.props.model;
    // let style = {
    //   left: (panel.layoutAttach.leftEnable ? panel.layoutAttach.left : panel.position.left) | 0,
    //   top: (panel.layoutAttach.topEnable ? panel.layoutAttach.top : panel.position.top) | 0,
    //   width: (panel.layoutAttach.widthEnable ? panel.layoutAttach.width : panel.position.width) | 0,
    //   height: (panel.layoutAttach.heightEnable ? panel.layoutAttach.height : panel.position.height) | 0,
    // };
    let style = {
      left: panel.left | 0,
      top: panel.top | 0,
      width: panel.width | 0,
      height: panel.height | 0
    }
    return (
      <div id={panel.domId} style={style} className={`ohdash-panel ${panel.className}${this._eventTag.isMoving ? ' moving' : ''}`}>
        <div className="panel-inner">
          <div style={{cursor: 'move'}} onMouseDown={this.onMoveDown.bind(this)} className="ctrl top">
            <Icon type="setting" onMouseDown={this.onSettingDown.bind(this)} className="item setting"/>
            <Icon type="delete" onMouseDown={this.onDeleteDown.bind(this)} className="item remove"/>
          </div>
          {
            panel.title ? (
              <div className="title">
                {panel.title}
              </div>
            ) : undefined
          }
          <div className="body">
            {panel.renderBody()}
          </div>
          <div className="ctrl bottom">
            <Icon onMouseDown={this.onSizeDown.bind(this)} type="arrow-salt" className="item resize"/>
          </div>
        </div>
      </div>
    )
  }
}