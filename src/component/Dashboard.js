import React from 'react';
import Panel from '../struct/Panel';
import dashboard from '../struct/Dashboard';
import { PANEL_CSS_ID_REPLACE_HOLDER, PANEL_CSS_ID_REPLACE_REGEXP } from '../struct/constants';
import PanelEditor from './PanelEditor';
import { parseLess, appendCssStyle, $id } from '../common/util';
import { DASHBOARD_STYLE_ID, DASHBOARD_ID } from '../struct/constants';
import "./dashboard.less";
import "./panel.less";

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      init: false,
      editPanel: null
    };
    this.onPanelAddedHandler = this.onPanelAdded.bind(this);
    this.onEditPanelChangedHandler = this.onEditPanelChanged.bind(this);
    this.onPanelRemovedHandler = this.onPanelRemoved.bind(this);
    this.onResizeHandler = this.onResize.bind(this);
    this._resizeTM = null;
    this._doResizeHandler = this._doResize.bind(this);
  }
  componentDidMount() {
    dashboard.on('panel-added', this.onPanelAddedHandler);
    dashboard.on('panel-removed', this.onPanelRemovedHandler);
    dashboard.on('edit-panel-changed', this.onEditPanelChangedHandler);
    // dashboard.attachDOM(this.refs.dashboard);
    dashboard.resize(this.refs.dashboard.offsetWidth, this.refs.dashboard.offsetHeight);
    window.addEventListener('resize', this.onResizeHandler);
  }
  componentWillUnmount() {
    // dashboard.detachDOM();
    dashboard.off('panel-added', this.onPanelAddedHandler);
    dashboard.off('panel-removed', this.onPanelRemovedHandler);
    dashboard.off('edit-panel-changed', this.onEditPanelChangedHandler);
    window.removeEventListener('resize', this.onResizeHandler);
  }
  _doResize() {
    this._resizeTM = null;
    dashboard.resize(this.refs.dashboard.offsetWidth, this.refs.dashboard.offsetHeight);
    this.setState({});
  }
  onResize() {
    if (this._resizeTM) {
      clearTimeout(this._resizeTM);
    }
    this._resizeTM = setTimeout(this._doResizeHandler, 500);
  }
  onPanelAdded(panel) {
    panel._setStateCallback = () => {
      this.setState({})
    };
    this.setState({});
  }
  onEditPanelChanged(editPanel) {
    this.setState({});
  }
  onPanelRemoved(panel) {
    this.setState({});
  }
  render() {
    return (
      <div ref="dashboard" className="dash" id={DASHBOARD_ID}>
        <div className="dash-inner" style={{display: dashboard.editPanel ? 'none' : 'block'}}>
          {dashboard.panels.map(panel => {
            return panel.render();
          })}
        </div>
        {
          dashboard.editPanel ? <PanelEditor/> : undefined
        }
      </div>
    );
  }
}