import React from 'react';
import dashboard from '../struct/Dashboard';
import layoutHelper from '../struct/LayoutHelper';
import PanelEditor from './PanelEditor';
import Panel from './Panel';
import { DASHBOARD_ID } from '../struct/constants';
import LayoutHelper  from './LayoutHelper';
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
    let w = this.refs.dashboard.offsetWidth;
    let h = this.refs.dashboard.offsetHeight;
    dashboard.resize(w, h);
    layoutHelper.resize(w, h);
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
    let w = this.refs.dashboard.offsetWidth;
    let h = this.refs.dashboard.offsetHeight;
    dashboard.resize(w, h);
    layoutHelper.resize(w, h);
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
      <div className="dash" id={DASHBOARD_ID}>
        <div className="dash-inner" ref="dashboard" style={{display: dashboard.editPanel ? 'none' : 'block'}}>
          <LayoutHelper/>
          {dashboard.panels.map(panel => {
            return <Panel key={panel.id} dashboard={dashboard} model={panel}/>
          })}
        </div>
        {
          dashboard.editPanel ? <PanelEditor/> : undefined
        }
      </div>
    );
  }
}