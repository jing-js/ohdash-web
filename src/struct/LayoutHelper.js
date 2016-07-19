
import EventEmitter from './EventEmitter';
import { reduceFraction } from '../common/util';
import dashboard from './Dashboard';

class LayoutHelper extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.width = 0;
    this.height = 0;
    this._COL_COUNT = opts.COL_COUNT || 6;
    this._ROW_COUNT = opts.ROW_COUNT || 2;
    this._gridHintStep = {
      row: 0,
      col: 0
    };
    this.dashboard = dashboard;
    this._SNIP = 15;
    this._EDGE_SNIP = 15;
    this.expr = null;
  }
  render() {
    return this._colLines.map(line => line.render());
  };
  resize(width, height) {
    this.width = width;
    this.height = height;
    this._gridHintStep = {
      col: width / this._COL_COUNT,
      row: height / this._ROW_COUNT
    };
  }
  _findEdgeHint(panel, attrName, value) {
    let attrName2 = ({
      left: 'right',
      right: 'left',
      top: 'bottom',
      bottom: 'top'
    })[attrName];
    let isCol = ['left', 'width', 'right'].indexOf(attrName) >= 0;
    let minDelta = Infinity;
    let targetName = null;
    let target = null;
    for(let i = 0; i < this.dashboard.panels.length; i++) {
      let dst = this.dashboard.panels[i];
      if (dst === panel) {
        continue;
      }
      let delta1 = Math.abs(value - dst.position[attrName]);
      let delta2 = Math.abs(value - dst.position[attrName2]);
      let tn;
      let delta;
      if (delta1 <= delta2) {
        tn = attrName;
        delta = delta1;
      } else {
        tn = attrName2;
        delta = delta2;
      }
      if (delta <= this._EDGE_SNIP && delta < minDelta) {
        targetName = tn;
        target = dst;
        minDelta = delta;
      }
    }
    return target ? {
      isGrid: false,
      tail: false,
      expr: `${target.name}.${targetName}`,
      value: target[targetName],
      left: isCol ? target[targetName] : Math.min(target.left, panel.left),
      top: isCol ? Math.min(target.top, panel.top) : target[targetName],
      width: isCol ? 1 : Math.max(target.right, panel.right) - Math.min(target.left, panel.left),
      height: isCol ? Math.max(target.bottom, panel.bottom) - Math.min(target.top, panel.top) : 1,
    } : null;
  }
  _c_left_left() {
    return 0;
  }
  _c_left_top(panel) {
    return panel.top + panel.height / 2;
  }
  _c_left_width(panel, hintValue) {
    return hintValue - 1;
  }
  _c_left_height() {
    return 1;
  }
  _c_right_left(panel) {
    return panel.left + panel.width + 1;
  }
  _c_right_top(panel) {
    return panel.top + panel.height / 2;
  }
  _c_right_width(panel, hintValue) {
    return this.width - hintValue - 1;
  }
  _c_right_height() {
    return 1;
  }
  _c_top_left(panel) {
    return panel.left + panel.width / 2;
  }
  _c_top_top() {
    return 0;
  }
  _c_top_width() {
    return 1;
  }
  _c_top_height(panel, hintValue) {
    return hintValue - 1;
  }
  _c_bottom_left(panel) {
    return panel.left + panel.width / 2;
  }
  _c_bottom_top(panel, hintValue) {
    return hintValue + 1;
  }
  _c_bottom_width() {
    return 1;
  }
  _c_bottom_height(panel, hintValue) {
    return this.height - hintValue - 1;
  }
  _c_width_left(panel) {
    return panel.left;
  }
  _c_width_top(panel) {
    return panel.top - 6;
  }
  _c_width_width(panel, hintValue) {
    return hintValue;
  }
  _c_width_height(panel) {
    return 1;
  }
  _c_height_left(panel) {
    return panel.left + panel.width;
  }
  _c_height_top(panel) {
    return panel.top;
  }
  _c_height_width() {
    return 1;
  }
  _c_height_height(panel, hintValue) {
    return hintValue;
  }
  _findGridHint(panel, attrName, value) {
    let isCol = ['left', 'width', 'right'].indexOf(attrName) >= 0;
    let isReverse = attrName === 'right' || attrName === 'bottom';
    let stepName = isCol ? 'col' : 'row';
    if (value < 0 || value > (isCol ? this.width : this.height)) {
      return null;
    }
    let step = this._gridHintStep[stepName];
    let N = (value / step) | 0;
    let hintValue = N * step;
    let delta = value - hintValue;
    let me = this;
    if (delta <= this._SNIP) {
      return genTarget();
    } else if (delta >= step - this._SNIP) {
      hintValue += step;
      N++;
      return genTarget();
    } else {
      return null;
    }
    function genTarget() {
      let fm = isCol ? me._COL_COUNT : me._ROW_COUNT;
      let title = '';
      let fr = null;
      if (N >= 1 && N < fm) {
        fr = reduceFraction(isReverse ? fm - N : N, fm);
        title = `${fr[0]}/${fr[1]} 大盘${isCol ? '宽度' : '高度'}`;
      }
      return {
        isGrid: true,
        title: title,
        expr: fr ? `${isCol ? 'WIDTH' : 'HEIGHT'} * ${isReverse ? fr[1]  - fr[0] : fr[0]} / ${fr[1]}` : '',
        tail: true,
        value: hintValue,
        left: me[`_c_${attrName}_left`](panel, hintValue),
        top: me[`_c_${attrName}_top`](panel, hintValue),
        width: me[`_c_${attrName}_width`](panel, hintValue),
        height: me[`_c_${attrName}_height`](panel, hintValue)
      }
    }
  }
  _findHint(panel, attrName, value) {
    return this._findGridHint(panel, attrName, value) || this._findEdgeHint(panel, attrName, value);
  }
  _findHeightHint(panel, width, value) {
    let step = width / 10;
    let N = (value / step) | 0;
    let hintValue = N * step;
    let delta = value - hintValue;
    if (value >= width) {
      return null;
    }
    if (delta <= this._EDGE_SNIP) {
      return genHint();
    } else if (delta >= step - this._EDGE_SNIP) {
      hintValue += step;
      N++;
      return genHint();
    }
    function genHint() {
      let title = '';
      let fr = null;
      if (N >= 1 && N < 10) {
        fr = reduceFraction(N, 10);
        title = `自身宽度的 ${fr[0]}/${fr[1]}`;
      }
      return {
        isGrid: false,
        tail: true,
        expr: fr ? `width * ${fr[0]} / ${fr[1]}` : '',
        value: hintValue,
        title: title,
        left: panel.left,
        top: panel.top + 1,
        width: 1,
        height: hintValue - 2
      }
    }
  }
  _start() {
    this.expr = this.expr || {
      left: '',
      top: '',
      right: '',
      width: '',
      height: '',
      bottom: ''
    };
  }
  size(panel, disableHint, width, height) {
    this._start();
    let expr = this.expr;
    if (disableHint) {
      setWH();
      expr.left = panel.attr.left;
      expr.width = width.toString();
      expr.right = '';
      expr.top = panel.attr.top;
      expr.height = height.toString();
      expr.bottom = '';
      this.emit('update', 'all', null);
      return;
    }
    let widthHint = this._findHint(panel, 'width', width);
    this.emit('update', 'left', widthHint);
    let rightHint = this._findHint(panel, 'right', panel.left + width);
    this.emit('update', 'right', rightHint);
    if (rightHint) {
      width = rightHint.value - panel.left;
    }
    if (widthHint) {
      width = widthHint.value;
    }
    if (rightHint && rightHint.expr) {
      expr.right = rightHint.expr;
      expr.left = '';
    } else {
      expr.right = '';
      expr.left = panel.attr.left;
    }
    if (widthHint && widthHint.expr) {
      expr.width = widthHint.expr;
    } else {
      expr.width = width.toString();
    }
    let heightHint = this._findHeightHint(panel, width, height);
    this.emit('update', 'top', heightHint);

    if (!heightHint) {
      heightHint = this._findHint(panel, 'height', height)
    }
    if (heightHint) {
      height = heightHint.value;
    }
    if (heightHint && heightHint.expr) {
      expr.height = heightHint.expr;
    } else {
      expr.height = height.toString();
    }
    expr.top = panel.attr.top;
    setWH();

    function setWH() {
      panel.width = width;
      panel.height = height;
      panel.right = panel.left + width;
      panel.bottom = panel.top + height;
    }
  }
  move(panel, disableHint, left, top) {
    this._start();
    let expr = this.expr;
    if (disableHint) {
      setLT();
      expr.left = left.toString();
      expr.width = panel.attr.width || (panel.width | 0).toString();
      expr.right = '';
      expr.top = top.toString();
      expr.height = panel.attr.height;
      expr.bottom = '';
      this.emit('update', 'all', null);
      return;
    }

    let leftHint = this._findHint(panel, 'left', left);
    this.emit('update', 'left', leftHint);
    let rightHint = this._findHint(panel, 'right', left + panel.width);
    this.emit('update', 'right', rightHint);

    if (rightHint) {
      left = rightHint.value - panel.width;
    }
    if (rightHint && rightHint.expr) {
      expr.right = rightHint.expr;
      expr.width = '';
    } else {
      expr.right = '';
      expr.width = panel.attr.width || (panel.width | 0).toString();
    }
    if (leftHint) {
      left = leftHint.value;
    }
    if (leftHint && leftHint.expr) {
      expr.left = leftHint.expr;
    } else {
      expr.left = left.toString();
    }

    let topHint = this._findHint(panel, 'top', top);
    if (!topHint || !topHint.isGrid) {
      this.emit('update', 'top', topHint);
    }
    // let bottomHint = this._findHint(panel, 'bottom', top + panel.height);
    // if (!bottomHint || !bottomHint.isGrid) {
    //   this.emit('update', 'bottom', bottomHint);
    // }

    if (topHint) {
      top = topHint.value;
    }
    if (topHint && topHint.expr) {
      expr.top = topHint.expr;
    } else {
      expr.top = top.toString();
    }
    expr.height = panel.attr.height;
    // if (bottomHint && bottomHint.expr) {
    //   expr.bottom = bottomHint.expr;
    //   expr.height = '';
    // } else {
    //   expr.bottom = '';
    //
    // }
    // console.log(expr.bottom)
    setLT();

    function setLT() {
      panel.left = left;
      panel.top = top;
      panel.right = left + panel.width;
      panel.bottom = top + panel.height;
    }
  }
  clear() {
    this.expr = null;
    this.emit('update', 'all', null);
  }
}

export default new LayoutHelper()
