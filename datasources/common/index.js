import ohdash from 'ohdash';
import { Input, Select, Radio } from 'antd';
const Option = Select.Option;
const RadioGroup = Radio.Group;

import './index.less';

const BODY_PLACEHOLDERS = {
  form: '请输入表单数据, 每行代表一个数据, 支持模板\nname = value\nname2 = value2\n...',
  json: '请输入JSON, 支持模板 \n{\n  key: "value"\n}',
  text: '请输入文本, 支持模板'
}

export default class CommonDataSource extends ohdash.BaseDataSource {
  static displayName = '通用';
  constructor() {
    super();
    this.state = {
      url: '',
      method: 'POST',
      type: 'form'
    }
  }
  onUrlChange() {

  }
  onMethodChange() {

  }
  onTypeChange() {

  }
  onBodyChange() {

  }
  render() {
    return (
      <div className="ohdash-common-data-source">
        <div>
          <label>URL:</label>
          <Input placeholder="任意URL, 支持模板" value={this.state.url} onChange={this.onUrlChange.bind(this)}/>
          <label>Method:</label>
          <Select vlaue={this.state.method} onChange={this.onMethodChange.bind(this)} placeholder="Http Method">
            <Option value="GET">GET</Option>
            <Option value="POST">POST</Option>
          </Select>
        </div>
        {this.state.method === 'POST' && (
          <div>
            <label>Type:</label>
            <RadioGroup value={this.state.type} onChange={this.onTypeChange.bind(this)}>
              <Radio key="form" value="form">Form</Radio>
              <Radio key="json" value="json">Json</Radio>
            </RadioGroup>
          </div>
        )}
        {this.state.method === 'POST' && (
          <div>
            <label>Body:</label>
            <Input type="textarea" onChange={this.onBodyChange.bind(this)} placeholder={BODY_PLACEHOLDERS[this.state.type]}/>
          </div>
        )}
      </div>
    )
  }
}

ohdash.registerDataSource(CommonDataSource);
