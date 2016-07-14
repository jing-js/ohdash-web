import ohdash from 'ohdash';
import { Alert, Input } from 'antd';

import './index.less';

class TextPanel extends ohdash.BasePanel {
  static displayName = '文本面板';
  constructor(dashboard) {
    super(dashboard);
    this.attr.less += `

> .body {
  text-align: left;
  font-size: 13px;
}`;
    this.attr.text = '任意文本内容, 支持模板和<a href="http://hansight.com" target="_blank">HTML</a>'
  }
  onTextChange(evt) {
    let val = evt.target.value;
    if (!val.trim()) {
      return;
    }
    this.attr.text = val;
    this._setStateCallback();
  }
  _parseText(text) {
    return {
      __html: text.replace(/\n/g, '<br/>')
    };
  }
  renderBody() {
    let text = this.attr.text || '';
    return (
      <div dangerouslySetInnerHTML={this._parseText(text)}>
      </div>
    );
  }
  renderContentTab() {
    return (
      <div>
        <Alert closable type="info" message="文本内容支持 html, 且支持模板。如果需要设置颜色或字号大小, 请通过【格式】面板添加 css。"/>
        <div>
          <label>文本:</label>
          <Input type="textarea" onChange={this.onTextChange.bind(this)} value={this.attr.text} />
        </div>
      </div>
    );
  }
  renderDataSourceTab() {
    return 'This is TextPanel\'s DataSourceTab';
  }
}

ohdash.registerPanel(TextPanel);

export default TextPanel;
