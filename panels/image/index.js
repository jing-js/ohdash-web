import ohdash from 'ohdash';

import './index.less';

class ImagePanel extends ohdash.BasePanel {
  static displayName = '图片面板';
  constructor(dashboard) {
    super(dashboard);
  }
  renderBody() {
    return 'This is ImagePanel';
  }
  renderContentTab() {
    return 'This is ImagePanel\'s ContentTab';
  }
  renderDataSourceTab() {
    return 'This is ImagePanel\'s DataSourceTab';
  }
}

ohdash.registerPanel(ImagePanel);

export default ImagePanel;
