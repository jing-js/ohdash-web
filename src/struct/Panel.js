import React from 'react';
import { Icon } from 'antd';
import Rect from './Rect';
import LayoutItem from './LayoutItem';
import NameManager from './NameManager';
import EventEmitter from './EventEmitter';
import { extendProto } from '../common/util';

let autoId = 0;

class Panel extends EventEmitter {
  constructor(dashboard) {
    super();

    LayoutItem.call(this);

    this.id = (autoId++).toString(36);
    this.dashboard = dashboard;
    this.attr = {
      name: NameManager.generate(),
      left: '',
      right: '',
      width: '',
      top: '',
      bottom: '',
      height: '',
      title: '新建面板',
      less: `
> .panel-inner {
  margin: 7px;
  background: #fff;
  box-shadow: 0 1px 1px rgba(0,0,0,.15);
}`
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
    this.css = '';
    
    this.position = new Rect();

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
}

extendProto(LayoutItem, Panel);

export default Panel;
