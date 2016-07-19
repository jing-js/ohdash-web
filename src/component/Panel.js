import React from 'react';
import { Icon } from 'antd';
import Point from '../struct/Point';
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

    this._onUpdateHandler = this._onUpdate.bind(this);
  }
  _onUpdate() {
    this.setState({});
  }
  componentDidMount() {
    this.props.model.on('update', this._onUpdateHandler);
  }
  componentWillUnmount() {
    this.props.model.off('update', this._onUpdateHandler);
  }
  _onMouseDown(evt) {
    let et = this._eventTag;
    if (et.isDown) {
      this._onMouseUp(); // clear previous mousedown
    }
    et.isDown = true;
    et.downPoint.set(evt.pageX, evt.pageY);
    this.props.model.emit('mousedown', et.downPoint);
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
    layoutHelper.move(panel, evt.metaKey || evt.ctrlKey, et.downPosition.x + et.delta.x, et.downPosition.y + et.delta.y);
    this.setState({});
  }
  onSizeMove(evt) {
    this._onMouseMove(evt);
    let panel = this.props.model;
    let et = this._eventTag;
    layoutHelper.size(panel, evt.metaKey || evt.ctrlKey, et.downPosition.x + et.delta.x, et.downPosition.y + et.delta.y);
    this.setState({});
  }
  _onMouseUp() {
    let et = this._eventTag;
    document.removeEventListener('mousemove', et.moveHandler);
    document.removeEventListener('mouseup', et.upHandler);
    et.isMoving &&  this._afterMove();
    et.isMoving = false;
    et.isDown = false;
    et.moveHandler = null;
    et.upHandler = null;
    this.props.model.emit('mouseup');
  }
  onMoveUp(evt) {
    this._onMouseUp();
  }
  onSizeUp(evt) {
    this._onMouseUp();
  }
  onSettingDown(evt) {
    this.props.dashboard.editPanel = this.props.model;
    evt.stopPropagation();
  }
  onDeleteDown(evt) {
    this.props.dashboard.removePanel(this.props.model);
    evt.stopPropagation();
  }
  _updateMove(calcPosition = false) {
    // const cache = new WeakMap();
    // const dashboard = this.props.dashboard;
    this.props.model.dependents.forEach(update);

    function update(panel) {
      // if (cache.has(panel)) {
      //   return;
      // }
      // if (calcPosition) {
      //   dashboard._calcPosition(panel);
      // }
      panel.emit('update');
      // cache.set(panel, true);
      for(let i = 0; i < panel.dependents.length; i++) {
        update(panel.dependents[i]);
      }
    }
  }
  _afterMove() {
    let err = this.props.dashboard.updatePanelPos(this.props.model, layoutHelper.expr, true);
    if (err) {
      console.log(err);
    }
    this._updateMove();
    layoutHelper.clear();

  }
  render() {
    let panel = this.props.model;
    let style = {
      left: panel.left | 0,
      top: panel.top | 0,
      width: panel.width | 0,
      height: panel.height | 0
    };
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