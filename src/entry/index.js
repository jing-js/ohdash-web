import ReactDom from 'react-dom';
import Router from './router';

import dashboard from '../struct/Dashboard';
import Panel from '../struct/Panel';
import DataSource from '../struct/DataSource';
import { DASHBOARD_ID, DASHBOARD_STYLE_ID } from '../struct/constants';
import { parseLess, appendCssStyle, $id, $remove } from '../common/util';

const ohdash = {
  __dashboardForDebug: dashboard,
  BasePanel: Panel,
  BaseDataSource: DataSource,
  registerPanel(PanelClass) {
    return dashboard.registerPanel(PanelClass);
  },
  registerDataSource(DataSourceClass) {
    return dashboard.registerDataSource(DataSourceClass);
  },
  bootstrap(ele) {
    parseLess(dashboard.attr.css, DASHBOARD_ID).then(css => {
      appendCssStyle(css, DASHBOARD_STYLE_ID);

      $remove($id('splash'));
      $remove($id('splash-style'));

      ReactDom.render(Router, ele);
    });
  }
};

window.ohdash = ohdash;

export default ohdash;
