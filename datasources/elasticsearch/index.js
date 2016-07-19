import ohdash from 'ohdash';
import './index.less';

export default class ESDataSource extends ohdash.BaseDataSource {
  static displayName = 'Elasticsearch';
  constructor() {
    super();
  }
}

ohdash.registerDataSource(ESDataSource);
