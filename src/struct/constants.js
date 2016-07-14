
export const PANEL_PREVIEW_STYLE_ID = 'ohdash-panel-style-preview';
export const PANEL_PREVIEW_ID = 'ohdash-panel-preview';
export const DASHBOARD_ID = 'ohdash-dashboard';
export const DASHBOARD_STYLE_ID = `${DASHBOARD_ID}-style`;
export const PANEL_CSS_ID_REPLACE_HOLDER = '#PANEL_CSS_ID_REPLACE_HOLDER';
export const PANEL_CSS_ID_REPLACE_REGEXP = new RegExp(`[ ]*${PANEL_CSS_ID_REPLACE_HOLDER}`, 'g');
export const POSITION_X_ATTRS = ['left', 'right', 'width'];
export const POSITION_Y_ATTRS = ['top', 'bottom', 'height'];
export const POSITION_ATTRS = POSITION_X_ATTRS.concat(POSITION_Y_ATTRS);
export const POSITION_ATTR_NAMES = {
  left: '左边距',
  right: '右边距',
  width: '宽度',
  top: '上边距',
  bottom: '下边距',
  height: '高度'
};