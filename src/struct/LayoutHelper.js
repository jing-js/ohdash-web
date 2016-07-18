
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
    this._SNIP = 20;
    this._EDGE_SNIP = 10;
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
      if (N >= 1 && N < fm) {
        let fr = reduceFraction(isReverse ? fm - N : N, fm);
        title = `${fr[0]}/${fr[1]} 大盘${isCol ? '宽度' : '高度'}`;
      }
      return {
        isGrid: true,
        title: title,
        tail: true,
        value: hintValue,
        left: me[`_c_${attrName}_left`](panel, hintValue), // isCol ? (isR ? panel.left + panel.width + 1 : 0) : panel.left + panel.width / 2,
        top: me[`_c_${attrName}_top`](panel, hintValue), // isCol ? panel.top + panel.height / 2 : (isR ? panel.top + panel.height + 1 : 0),
        width: me[`_c_${attrName}_width`](panel, hintValue), // isCol ? (isR ? me.width - hintValue - 1 : hintValue - 1) : 1,
        height: me[`_c_${attrName}_height`](panel, hintValue) // isCol ? 1 : (isR ? me.height - hintValue - 1 : hintValue - 1)
      }
    }
  }
  _findHint(panel, attrName, value) {
    return this._findEdgeHint(panel, attrName, value) || this._findGridHint(panel, attrName, value);
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
      if (N >= 1 && N < 10) {
        let fr = reduceFraction(N, 10);
        title = `自身宽度的 ${fr[0]}/${fr[1]}`;
      }
      return {
        isGrid: false,
        tail: true,
        value: hintValue,
        title: title,
        left: panel.left,
        top: panel.top + 1,
        width: 1,
        height: hintValue - 2
      }
    }
  }
  sizePanel(panel, disableHint, width, height) {
    if (disableHint) {
      setWH();
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

    let heightHint = this._findHeightHint(panel, width, height);
    this.emit('update', 'top', heightHint);

    if (!heightHint) {
      heightHint = this._findHint(panel, 'height', height)
    }


    if (heightHint) {
      height = heightHint.value;
    }
    setWH();

    function setWH() {
      panel.width = width;
      panel.height = height;
      panel.right = panel.left + width;
      panel.bottom = panel.top + height;
    }
  }
  movePanel(panel, disableHint, left, top) {
    if (disableHint) {
      setLT();
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
    if (leftHint) {
      left = leftHint.value;
    }

    let topHint = this._findHint(panel, 'top', top);
    if (!topHint || !topHint.isGrid) {
      this.emit('update', 'top', topHint);
    }
    let bottomHint = this._findHint(panel, 'bottom', top + panel.height);
    if (!bottomHint || !bottomHint.isGrid) {
      this.emit('update', 'bottom', bottomHint);
    }

    if (topHint) {
      top = topHint.value;
    }
    setLT();

    function setLT() {
      panel.left = left;
      panel.top = top;
      panel.right = left + panel.width;
      panel.bottom = top + panel.height;
    }
  }
  // checkSize(panel, evt) {
  //   let lAtt = panel.layoutAttach;
  //
  //   let check = (type, step, GRID_COUNT, SNIP) => {
  //     let value = panel.position[type];
  //     let pn = (value / step) | 0;
  //     let attachValue = pn * step;
  //     let delta = value - attachValue;
  //     let aType = `${type}Enable`;
  //     let pe = lAtt[aType];
  //     if (delta < SNIP) {
  //       lAtt[aType] = true;
  //       lAtt[type] = attachValue;
  //     } else if (delta > step - SNIP) {
  //       lAtt[aType] = true;
  //       lAtt[type] = attachValue + step;
  //       pn++;
  //     } else {
  //       lAtt[aType] = false;
  //     }
  //     let __isHor = type === 'width';
  //     if (lAtt[aType]) {
  //       this.emit('grid-line-shown', __isHor ? 'hor' : 'ver', lAtt[aType], {
  //         // y: ,
  //         // x: __isWidth ? panel.left,
  //         position: {
  //           left: __isHor ? panel.left : panel.left + (lAtt.widthEnable ? lAtt.width : panel.width) + 5,
  //           top: __isHor ? panel.top - 5 : panel.top,
  //           len: attachValue
  //         },
  //         title: pn >= 1 && pn < GRID_COUNT ? `${this._FS[pn - 1]} 大盘${__isHor ? '宽度' : '高度'}` : ''
  //       });
  //     } else if (pe !== lAtt[aType]) {
  //       this.emit('grid-line-shown', __isHor ? 'hor' : 'ver', false);
  //     }
  //   };
  //
  //   if (!evt.metaKey && !evt.ctrlKey) {
  //     check('width', this._colWidth, this._COL_COUNT, this._COL_SNIP);
  //     check('height', this._rowHeight, this._ROW_COUNT, this._ROW_SNIP);
  //   } else if (lAtt.widthEnable || lAtt.heightEnable) {
  //     lAtt.widthEnable = false;
  //     lAtt.heightEnable = false;
  //     this.emit('grid-line-shown', 'all', false);
  //   }
  //
  // }
  // checkMove(panel, evt) {
  //
  //   let lAtt = panel.layoutAttach;
  //
  //   let check = (type, step, GRID_COUNT, SNIP) => {
  //     let value = panel.position[type];
  //     let pn = (value / step) | 0;
  //     let attachValue = pn * step;
  //     let delta = value - attachValue;
  //     let aType = `${type}Enable`;
  //     let pe = lAtt[aType];
  //     if (delta < SNIP) {
  //       lAtt[aType] = true;
  //       lAtt[type] = attachValue;
  //     } else if (delta > step - SNIP) {
  //       lAtt[aType] = true;
  //       lAtt[type] = attachValue + step;
  //       pn++;
  //     } else {
  //       lAtt[aType] = false;
  //     }
  //     let __isHor = type === 'left';
  //     if (lAtt[aType]) {
  //       console.log(type, lAtt[type]);
  //       let __type = __isHor ? 'top' : 'left';
  //       let __len = lAtt[`${__type}Enable`] ? lAtt[__type] : panel.position[__type];
  //       this.emit('grid-line-shown', __isHor ? 'hor' : 'ver', lAtt[aType], {
  //         position: {
  //           len: lAtt[type],
  //           left: __isHor ? 0 :  __len + panel.width / 2,
  //           top: __isHor ? panel.height / 2 + __len : 0,
  //         },
  //         title: pn >= 1 && pn < GRID_COUNT ? `${this._FS[pn - 1]} 大盘${__isHor ? '宽度' : '高度'}` : ''
  //       });
  //     } else if (pe !== lAtt[aType]) {
  //       this.emit('grid-line-shown', __isHor ? 'hor' : 'ver', false);
  //     }
  //   };
  //
  //   if (!evt.metaKey && !evt.ctrlKey) {
  //     check('left', this._colWidth, this._COL_COUNT, this._COL_SNIP);
  //     check('top', this._rowHeight, this._ROW_COUNT, this._ROW_SNIP);
  //   } else if (lAtt.leftEnable || lAtt.topEnable) {
  //     lAtt.leftEnable = false;
  //     lAtt.topEnable = false;
  //     this.emit('grid-line-shown', 'all', false);
  //   }
  //
  // }
  clear() {
    this.emit('update', 'all', null);
  }
}

export default new LayoutHelper()
