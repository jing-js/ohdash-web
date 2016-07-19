import { appendCssStyle, $remove, parseLess, $id } from '../common/util';
import { 
  PANEL_PREVIEW_STYLE_ID,
  PANEL_CSS_ID_REPLACE_HOLDER,
  PANEL_CSS_ID_REPLACE_REGEXP,
  POSITION_ATTRS,
  POSITION_ATTR_NAMES
} from './constants';
import EventEmitter from './EventEmitter';
import Rect from './Rect';
import LayoutItem from './LayoutItem';

const DASH_REGEXP = /(?:^|[^a-zA-Z0-9\$\_\.])(WIDTH|HEIGHT)(?:$|[^a-zA-Z0-9\$\_\.])/g;
const DEP_ME_REGEXP = /(?:^|[^a-zA-Z0-9\$\_\.])(left|right|top|bottom|width|height)(?:$|[^a-zA-Z0-9\$\_\.])/g;
const DEP_REGEXP = /(?:^|[^a-zA-Z0-9\$\_\.])([\$\_a-zA-Z][\$\_a-zA-Z0-9]*)\.(left|right|top|bottom|width|height)(?:$|[^a-zA-Z0-9\$\_\.])/g;


const POSITION_LAYOUT_ITEMS = (function () {
  let r = Object.create(null);
  let arr = [];
  POSITION_ATTRS.forEach(attr => {
    r[attr] = new LayoutItem();
    r[attr].__name = attr;
    arr.push(r[attr]);
  });
  r.__reset = function () {
    POSITION_ATTRS.forEach(attr => {
      r[attr].dependencies.length = 0;
      r[attr].dependents.length = 0;
    });
  };
  r.__toArray = function () {
    return arr;
  };
  return r;
})();

const POSITION_ATTR_CALC = {
  left: 'right - width',
  right: 'left + width',
  width: 'right - left',
  top: 'bottom - height',
  bottom: 'top + height',
  height: 'bottom - top'
};

class Dashboard extends EventEmitter {
  constructor() {
    super();
    this._$ele = null;
    this.panels = [];
    this._panelMap = {};
    this._panelLayoutSequence = [];
    this.width = 0;
    this.height = 0;
    this._editPanel = null;
    this._panelClasses = [];
    this._dataSourceClasses = [];
    this._exprFnCache = new Map();
    this.attr = {
      css: 'padding: 7px'
    };
    this.__positionCalcContext__ = {
      WIDTH: 0,
      HEIGHT: 0,
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0
    };
  }
  
  attachDOM($dashboard) {
    if (this._$ele) {
      throw new Error('dashboard has already been attached.')
    }
    this._$ele = $dashboard;
    this.width = this._$ele.offsetWidth;
    this.height = this._$ele.offsetHeight;
  }
  detachDOM() {
    if (!this._$ele) {
      return;
    }
    this._$ele = null;
    this.width = 0;
    this.height = 0;
  }
  get editPanel() {
    return this._editPanel;
  }
  set editPanel(panel) {
    if (this._editPanel === panel) {
      return;
    }
    this._editPanel = panel;
    this._updatePreviewCssStyle(panel);
    this.emit('edit-panel-changed', panel);
  }
  _parseExprFn(exprStr) {
    if (!exprStr) {
      return null;
    }
    if (!this._exprFnCache.has(exprStr)) {
      let fnBody = exprStr;
      if (exprStr.indexOf('\n') < 0) {
        fnBody = `return ${exprStr};`;
      }
      this._exprFnCache.set(exprStr, new Function('__ohdash__', fnBody));
    }
    return this._exprFnCache.get(exprStr);
  }
  addPanel(panel) {
    parseLess(panel.less, PANEL_CSS_ID_REPLACE_HOLDER).then(css => {
      panel.css = css;
      appendCssStyle(css.replace(PANEL_CSS_ID_REPLACE_REGEXP, '#' + panel.domId), panel.cssStyleId);
    }).then(() => {
      this._initPanel(panel);
      // 初始加入的面板不会有依赖关系, 直接 push 到最后。
      this._panelLayoutSequence.push(panel);
      this._editPanel = panel;
      this._updatePreviewCssStyle(panel);
      this.emit('panel-added', panel);
    }, err => {
      alert(err);
    });
  }

  /**
   * 获取推荐的面板位置
   * @returns {{x: number, y: number}}
   * @private
   */
  _getSuggestRect() {
    let my = 0;
    for(let i = 0; i < this.panels.length; i++) {
      let pos = this.panels[i].position;
      if (my < pos.bottom) {
        my = pos.bottom;
      }
    }
    let w = this.width / 8;
    return new Rect(0, my, w, w * 0.6);
  }
  _initPanel(panel) {
    let rect = this._getSuggestRect();
    ['left', 'width', 'top', 'height'].forEach(attr => {
      panel.position[attr] = rect[attr];
      panel.attr[attr] = rect[attr].toString();
    });
    panel.expr.__sequence = POSITION_ATTRS;
    POSITION_ATTRS.forEach(attr => {
      let expr = panel.attr[attr];
      panel.expr[attr] = this._parseExprFn(expr ? expr : POSITION_ATTR_CALC[attr].replace(/\w+/g, m => `__ohdash__.${m}`));
    });
    panel.position.right = rect.left + rect.width;
    panel.position.bottom = rect.top + rect.height;
    this.panels.push(panel);
    if (this._panelMap[panel.name]) {
      throw new Error(`panel ${panel.name} already exists`);
    }
    this._panelMap[panel.name] = panel;
    this.__positionCalcContext__[panel.name] = panel.position;
  }
  _updatePreviewCssStyle(panel) {
    let $s = $id(PANEL_PREVIEW_STYLE_ID);
    if (!panel) {
      $s && $remove($s);
      return;
    }
    let css = panel.css.replace(PANEL_CSS_ID_REPLACE_REGEXP, `#ohdash-panel-preview`);
    if (!$s) {
      appendCssStyle(css, PANEL_PREVIEW_STYLE_ID);
    } else {
      $s.textContent = css;
    }
  }
  _updatePanelCssStyle(panel) {
    $id(panel.cssStyleId).textContent = panel.css.replace(PANEL_CSS_ID_REPLACE_REGEXP, '#' + panel.domId);
  }
  removePanel(panel) {
    if (panel.dependents.length > 0) {
      throw new Error('不能移除该面板, 已被其它面板依赖');
    }
    if (this._panelMap.hasOwnProperty(panel.name)) {
      delete this._panelMap[panel.name];
    }
    if (this.__positionCalcContext__.hasOwnProperty(panel.name)) {
      delete this.__positionCalcContext__[panel.name];
    }
    let i = this.panels.indexOf(panel);
    if (i >= 0) {
      this.panels.splice(i, 1);
    }
    panel.dependencies.forEach(dPanel => {
      dPanel.removeDependent(panel);
    });
    panel.dependencies.length = 0;
    $remove(panel.cssStyleId);
    panel.dashboard = null;
    i = this._panelLayoutSequence.indexOf(panel);
    if (i >= 0) {
      this._panelLayoutSequence.splice(i, 1);
    }
    this.emit('panel-removed', panel);
  }
  _parsePosAttrs(panel, vAttrs, ignoreCircle = false) {
    POSITION_LAYOUT_ITEMS.__reset();
    let exprFn = {};
    let deps = [];
    for(let i = 0; i < POSITION_ATTRS.length; i++) {
      let attr = POSITION_ATTRS[i];
      let expr = vAttrs[attr].trim();
      if (!expr) {
        expr = POSITION_ATTR_CALC[attr];
      }
      let circleReset = false;
      expr = expr.replace(DEP_REGEXP, (m0, m1, m2) => {
        let dep = this._panelMap[m1];
        if (!dep) {
          throw new Error(`${POSITION_ATTR_NAMES[attr]}依赖的面板${m1}不存在`);
        }
        if (dep === panel) {
          throw new Error(`${POSITION_ATTR_NAMES[attr]}不应该依赖自身。你可以直接使用${m2}来引用自身属性。`);
        }
        let deeps = [];
        dep.checkDeepDependence(panel, deeps);
        if (deeps.length > 0) {
          if (!ignoreCircle) {
            let depLoop = [dep.name];
            let p = dep;
            deeps.forEach(deep => {
              depLoop.push(p.dependencies[deep].name);
              p = p.dependencies[deep];
            });
            depLoop.push(depLoop[0]);
            throw new Error(`检测到面板位置之间的循环依赖: ${depLoop.join(' -> ')}`);
          } else {
            circleReset = true;
          }
        } else if (deps.indexOf(dep) < 0) {
          deps.push(dep);
        }
        return m0.replace(m1, `__ohdash__.${m1}`);
      });

      if (circleReset) {
        expr = panel[attr].toString();
      }

      expr = expr.replace(DASH_REGEXP, (m0, m1) => {
        return m0.replace(m1, `__ohdash__.${m1}`);
      });

      let item = POSITION_LAYOUT_ITEMS[attr];
      expr = expr.replace(DEP_ME_REGEXP, (m0, m1) => {
        if (m1 === attr) {
          throw new Error(`${POSITION_ATTR_NAMES[attr]}不能依赖 ${attr}`);
        }
        let dep = POSITION_LAYOUT_ITEMS[m1];
        let deeps = [];
        dep.checkDeepDependence(item, deeps);
        if (deeps.length > 0) {
          let depLoop = [POSITION_ATTR_NAMES[dep.__name]];
          let p = dep;
          deeps.forEach(deep => {
            depLoop.push(POSITION_ATTR_NAMES[p.dependencies[deep].__name]);
            p = p.dependencies[deep];
          });
          depLoop.push(depLoop[0]);
          throw new Error(`检测到循环依赖: ${depLoop.join(' -> ')}`);
        }
        item.addDependence(dep);
        dep.addDependent(item);
        return m0.replace(m1, `__ohdash__.${m1}`);
      });
      exprFn[attr] = this._parseExprFn(expr);
      try {
        exprFn[attr](this.__positionCalcContext__);
      } catch(ex) {
        throw new Error(`${POSITION_ATTR_NAMES[attr]}的表达式 ${vAttrs[attr].trim()} 计算出错：${ex.message}`);
      }
    }

    return {
      posSequence: LayoutItem.calcLayoutSequence(POSITION_LAYOUT_ITEMS.__toArray()).map(item => item.__name),
      dependencies: deps,
      exprFn
    };
  }
  updatePanelName(panel, name) {
    if (panel.name === name) {
      return;
    }
    if (panel.dependents.length > 0) {
      return `有${panel.dependents.length}个面板的位置依赖了该面板, 因此不能修改面板名称`;
    }
    if (this._panelMap.hasOwnProperty(name) && this._panelMap[name] !== panel) {
      return `名称为${name}的面板已经存在, 不能有重复名称的面板`;
    }
    if (name && !/^[a-zA-Z\$\_][a-zA-Z0-9\$\_]*$/.test(name)) {
      return `名称 ${name} 不符合要求, 只能使用英文字母、数字、$ 和 _ 符号, 且不能用数字开头`;
    }
    if (this._panelMap.hasOwnProperty(panel.name)) {
      delete this._panelMap[panel.name];
    }
    if (this.__positionCalcContext__.hasOwnProperty(panel.name)) {
      delete this.__positionCalcContext__[panel.name];
    }
    panel.name = name;
    if (name) {
      this._panelMap[name] = panel;
      this.__positionCalcContext__[name] = panel.position;
    }
  }
  updatePanelPos(panel, newAttrs, ignoreCircle = false) {
    let result;
    try {
      result = this._parsePosAttrs(panel, newAttrs, ignoreCircle);
    } catch(ex) {
      console.log(ex)
      return ex.message;
    }

    panel.dependencies.forEach(dPanel => {
      dPanel.removeDependent(panel);
    });
    panel.dependencies.length = 0;

    POSITION_ATTRS.forEach(attr => {
      panel.attr[attr] = newAttrs[attr];
      panel.expr[attr] = result.exprFn[attr];
      panel.expr.__sequence = result.posSequence;
    });

    result.dependencies.forEach(dep => {
      panel.addDependence(dep);
      dep.addDependent(panel);
    });
    this._panelLayoutSequence = LayoutItem.calcLayoutSequence(this.panels);
    this._layout();
  }
  
  _layout() {
    this.__positionCalcContext__.WIDTH = this.width;
    this.__positionCalcContext__.HEIGHT = this.height;
    this._panelLayoutSequence.forEach(panel => {
      this._calcPosition(panel);
    });
  }
  _calcPosition(panel) {
    panel.expr.__sequence.forEach(attr => {
      try {
        panel[attr] = panel.expr[attr](this.__positionCalcContext__);
        this.__positionCalcContext__[attr] = panel[attr];
      } catch(ex) {
        console.log(ex);
        alert(ex.message);
      }
    });
  }
  resize(width, height) {
    this.width = width;
    this.height = height;
    this._layout();
  }
  registerPanel(PanelClass) {
    if (checkExists(this._panelClasses, PanelClass)) {
      throw new Error(`Panel ${PanelClass.name} is already exists.`);
    }
    this._panelClasses.push(PanelClass);
  }
  registerDataSource(DataSourceClass) {
    if (checkExists(this._dataSourceClasses, DataSourceClass)) {
      throw new Error(`DataSource ${DataSourceClass.name} is already exists.`);
    }
    console.log('reg ds')
    this._dataSourceClasses.push(DataSourceClass);
  }
}

function checkExists(arr, item) {
  for(let i = 0; i < arr.length; i++) {
    if (arr[i] === item || arr[i].name === item.name) {
      return true;
    }
  }
  return false;
}

export default new Dashboard();
