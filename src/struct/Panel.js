import React from 'react';
import { Icon } from 'antd';
import Rect from './Rect';
import LayoutItem from './LayoutItem';

let autoId = 0;

class Panel extends LayoutItem {
  constructor(dashboard) {
    super();
    this.dashboard = dashboard;
    this.id = (autoId++).toString(36);
    this.attr = {
      name: '',
      left: '',
      right: '',
      width: '',
      top: '',
      bottom: '',
      height: '',
      title: '新建面板',
      less: `background: #fff;\nbox-shadow: 0 1px 1px rgba(0,0,0,.15);`
    };
    this.expr = {
      __sequence: null,
      left: null,
      right: null,
      width: null,
      top: null,
      bottom: null,
      height: null
    };

    this.dataSource = null;
    this._setStateCallback = null;
    this.css = '';
    
    this.position = new Rect();

    this._eventTag = {
      isDown: false,
      moveHandler: null,
      upHandler: null
    }
  }
  get name() {
    return this.attr.name;
  }
  set name(val) {
    this.attr.name = val;
  }
  get title() {
    return this.attr.title;
  }
  set title(title) {
    this.attr.title = title;
  }
  get left() {
    return this.position.left;
  }
  set left(val) {
    this.position.left = val;
  }
  get right() {
    return this.position.right;
  }
  set right(val) {
    this.position.right = val;
  }
  get width() {
    return this.position.width;
  }
  set width(val) {
    this.position.width = val;
  }
  get top() {
    return this.position.top;
  }
  set top(val) {
    this.position.top = val;
  }
  get bottom() {
    return this.position.bottom;
  }
  set bottom(val) {
    this.position.bottom = val;
  }
  get height() {
    return this.position.height;
  }
  set height(val) {
    this.position.height = val;
  }

  /**
   * get panel's DOM id
   * @returns {string}
   */
  get domId() {
    return `ohdash-panel-${this.id}`;
  }
  get className() {
    return `ohdash-panel-${this.constructor.name}`;
  }
  get cssStyleId() {
    return `ohdash-panel-style-${this.id}`;
  }
  get less() {
    return this.attr.less;
  }
  renderBody() {
    return 'renderBody is abstract function, you must override it'
  }
  renderContentTab() {
    return 'renderContentTab is abstract function, you must override it';
  }
  renderDataSourceTab() {
    return 'renderDataSourceTab is abstract function, you must override it';
  }
  onMoveDown(evt) {
    console.log(evt.nativeEvent);
  }
  onMoveMove() {

  }
  onMoveUp() {

  }
  onSettingDown(evt) {
    this.dashboard.editPanel = this;
    evt.stopPropagation();
  }
  onDeleteDown(evt) {
    this.dashboard.removePanel(this);
    evt.stopPropagation();
  }
  render() {
    let style = {
      left: this.position.left | 0,
      top: this.position.top | 0,
      width: this.position.width | 0,
      height: this.position.height | 0
    };
    return (
      <div key={this.id} id={this.domId} style={style} className={`ohdash-panel ${this.className}`}>
        <div style={{cursor: 'move'}} onMouseDown={this.onMoveDown.bind(this)} className="ctrl top">
          <Icon type="setting" onMouseDown={this.onSettingDown.bind(this)} className="item setting"/>
          <Icon type="delete" onMouseDown={this.onDeleteDown.bind(this)} className="item remove"/>
        </div>
        {
          this.attr.title ? (
            <div className="title">
              {this.attr.title}
            </div>
          ) : undefined
        }
        <div className="body">
          {this.renderBody()}
        </div>
        <div className="ctrl bottom">
          <Icon type="arrow-salt" className="item resize"/>
        </div>
      </div>
    )
  }
}

export default Panel;
