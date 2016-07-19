import React from 'react';
import { Tabs, Button, Form, Input, Alert, Icon, Select } from 'antd';
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const FormItem = Form.Item;
import dashboard from '../struct/Dashboard';
import { parseLess } from '../common/util';
import { PANEL_CSS_ID_REPLACE_HOLDER, POSITION_X_ATTRS, POSITION_Y_ATTRS, POSITION_ATTRS } from '../struct/constants';

import './panel-editor.less';

export default class PanelEditor extends React.Component {
  constructor(props) {
    super(props);
    this.dashboard = dashboard;
    this.panel = dashboard.editPanel;
    let attr = this.panel.attr;
    this.state = {
      _error: null,
      _lessState: 0, // 0: ready, 1: busy, 2: willRedo
      tab: 'data',
      attr: {
        left: attr.left,
        right: attr.right,
        width: attr.width,
        top: attr.top,
        bottom: attr.bottom,
        height: attr.height,
        name: attr.name,
        title: attr.title,
        less: attr.less,
        script: attr.script,
        dataSource: undefined
      }
    };
    this._formTM = null;
    this._onUpdateHandler = this._onUpdate.bind(this);
  }
  _onUpdate() {
    this.setState({});
  }
  componentDidMount() {
    this.panel.on('update', this._onUpdateHandler);
  }
  componentWillUnmount() {
    this.panel && this.panel.off('update', this._onUpdateHandler);
  }
  onTabChange(tab) {
    if (tab !== 'title') {
      if (this._formTM !== null) {
        clearTimeout(this._formTM);
        this._formTM = null;
      }
      this.setState({
        _error: null,
        tab
      });
    }
  }
  onCssChange(evt) {
    let val = evt.target.value;
    let attr = this.state.attr;
    attr.less = val;
    this.setState({
      attr,
      _error: null
    });
    if (val === this.panel.attr.less) {
      return;
    }
    if (this._formTM) {
      clearTimeout(this._formTM);
    }
    this._formTM = setTimeout(() => {
      this._parseLess();
    }, 800);
  }
  _parseLess() {
    this._formTM = null;
    if (this.state._lessState !== 0) { // already in process
      this.state._lessState = 2;
      return;
    }
    this.setState({
      _lessState: 1,
      _error: null
    });
    parseLess(this.state.attr.less, PANEL_CSS_ID_REPLACE_HOLDER).then(css => {
      if (this.state._lessState === 2) {
        this.state._lessState = 0;
        this._parseLess();
      } else if (this.state._lessState === 1) {
        this.setState({
          _lessState: 0
        });
        this.panel.attr.less = this.state.attr.less;
        this.panel.css = css;
        this.dashboard._updatePreviewCssStyle(this.panel);
        this.dashboard._updatePanelCssStyle(this.panel);
      }
    }, err => {
      this.setState({
        _lessState: 0,
        _error: `语法错误: ${err.message}`
      });
    });
  }
  onScriptChange(evt) {
    let val = evt.target.value;
    let attr = this.state.attr;
    attr.script = val;
    this.setState({
      attr
    });
  }
  onNameChange(evt) {
    let val = evt.target.value;
    let attr = this.state.attr;
    attr.name = val;
    if (!val.trim()) {
      this.setState({
        _error: '名称不能为空',
        attr
      });
      return;
    }
    if (/(left|right|top|bottom|width|height|WIDTH|HEIGHT)/.test(val.trim())) {
      this.setState({
        _error: `不能使用${val.trim()}作为面板名称`,
        attr
      });
      return;
    }
    
    let err = this.dashboard.updatePanelName(this.panel, val.trim());
    this.setState({
      _error: err ? err : null,
      attr
    });
  }
  onClose() {
    this.panel.off('update', this._onUpdateHandler);
    this.panel = null;
    this.state.attr = null;
    // editPanel setter will emit 'panel-changed' event to Dashboard
    dashboard.editPanel = null;
  }
  onTitleChange(evt) {
    let val = evt.target.value;
    let attr = this.state.attr;
    attr.title = val;
    this.panel.attr.title = val;
    this.setState({
      attr
    });
  }
  onPosChange(attrName, evt) {
    let expr = evt.target.value.replace(/^\s+/, ''); // left trim
    let attr = this.state.attr;
    attr[attrName] = expr;
    this.setState({
      _error: null,
      attr
    });
    console.log('on pos change')
    if (this._formTM) {
      clearTimeout(this._formTM);
    }
    this._formTM = setTimeout(() => {
      this.setState({
        _error: this._checkPos()
      })
    }, 800);
  }
  _checkPos() {
    this._formTM = null;
    let c = 0;
    let changed = false;
    POSITION_X_ATTRS.forEach(attr => {
      let v = this.state.attr[attr].trim();
      if (this.panel.attr[attr] !== v) {
        changed = true;
      }
      if (v) {
        c++;
      }
    });
    if (c <= 1) {
      return '左边距、右边距和宽度请设置其中两个属性';
    } else if (c > 2) {
      return '左边距、右边距和宽度最多只能设置其中两个属性';
    }
    c = 0;
    POSITION_Y_ATTRS.forEach(attr => {
      let v = this.state.attr[attr].trim();
      if (this.panel.attr[attr] !== v) {
        changed = true;
      }
      if (v) {
        c++;
      }
    });
    if (c <= 1) {
      return '上边距、下边距和高度请设置其中两个属性';
    } else if (c > 2) {
      return '上边距、下边距和高度最多只能设置其中两个属性';
    }
    if (!changed) {
      return;
    }
    let err = this.dashboard.updatePanelPos(this.panel, this.state.attr);
    return err ? err : null;
  }
  onDataSourceChange(ds) {
    let attr = this.state.attr;
    this.panel.dataSource = new ds();
    attr.dataSource = ds;
    this.setState({
      _error: null,
      attr
    });
  }
  render() {
    const curTab = this.state.tab;
    const panel = this.panel;
    const PanelClass = panel.constructor;
    const attr = this.state.attr;

    return (
      <div className="dash-panel-editor">
        <div className="preview">
          <div id='ohdash-panel-preview' className={`ohdash-panel ${panel.className} preview`}>
            {
              attr.title ? (
                <div className="title">
                  {attr.title}
                </div>
              ) : undefined
            }
            <div className="body">
              {panel.renderBody()}
            </div>
          </div>
        </div>
        <div className="tabs-nav">
          <Tabs activeKey={curTab} onChange={this.onTabChange.bind(this)}>
            <TabPane tab={<h3>{PanelClass.displayName}</h3>} key="title"/>
            <TabPane tab="内容" key="content"/>
            <TabPane tab="属性" key="attr"/>
            <TabPane tab="数据源" key="data"/>
            <TabPane tab="样式" key="css"/>
            <TabPane tab="脚本" key="script"/>
          </Tabs>
          <Icon type="cross" onClick={this.onClose.bind(this)}/>
        </div>
        <div style={curTab !== 'content' ? {display: 'none'} : null} className="tab-panel content">
          {
            panel.renderContentTab()
          }
        </div>
        <div style={curTab !== 'attr' ? {display: 'none'} : null} className="tab-panel attr">
          <div className={`tip`}>
            &nbsp;
            {this.state._error !== null && <span style={{color: 'red'}}>{this.state._error}</span>}
          </div>
          <div className="form-row">
            <label>名称：</label>
            <Input disabled={panel.dependents.length > 0} value={attr.name} onChange={this.onNameChange.bind(this)}/>
            <label>标题：</label>
            <Input value={attr.title} onChange={this.onTitleChange.bind(this)}/>
            <label>层次：</label>
            <Input type="number"/>
          </div>
          <div className="form-row">
            <label>左边距：</label>
            <Input value={attr.left} onChange={this.onPosChange.bind(this, 'left')}/>
            <label>右边距：</label>
            <Input value={attr.right} onChange={this.onPosChange.bind(this, 'right')}/>
            <label>宽度：</label>
            <Input value={attr.width} onChange={this.onPosChange.bind(this, 'width')}/>
          </div>
          <div className="form-row">
            <label>上边距：</label>
            <Input value={attr.top} onChange={this.onPosChange.bind(this, 'top')}/>
            <label>下边距：</label>
            <Input value={attr.bottom} onChange={this.onPosChange.bind(this, 'bottom')}/>
            <label>高度：</label>
            <Input value={attr.height} onChange={this.onPosChange.bind(this, 'height')}/>
          </div>
        </div>
        <div style={curTab !== 'data' ? {display: 'none'} : null} className="tab-panel data">
          <div>
            <Select style={{width: 200}} value={attr.dataSource} onChange={this.onDataSourceChange.bind(this)} placeholder="选择数据源">
              {
                this.dashboard._dataSourceClasses.map(ds => (
                  <Option key={ds.name} value={ds}>{ds.displayName}</Option>
                ))
              }
            </Select>
          </div>
          {
            panel.dataSource ? panel.dataSource.render() : (
              <p className="empty-tip">请先选择数据源</p>
            )
          }
        </div>
        <div style={curTab !== 'css' ? {display: 'none'} : null} className="tab-panel css">
          <div className={`tip`}>
            &nbsp;
            {this.state._error !== null && <span style={{color: 'red'}}>{this.state._error}</span>}
          </div>
          <div>
            <Input onChange={this.onCssChange.bind(this)} style={{minHeight: 200}} type="textarea" value={attr.less} placeholder="CSS 或 Less 代码" />
          </div>
        </div>
        <div style={curTab !== 'script' ? {display: 'none'} : null} className="tab-panel script">
          <div>
            <Input onChange={this.onScriptChange.bind(this)} style={{minHeight: 200}} type="textarea" value={attr.script} placeholder="Javascript 代码" />
          </div>
        </div>
      </div>
    )
  }
}