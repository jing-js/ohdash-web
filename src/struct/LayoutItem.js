import { pushIfNeed, removeIfNeed } from '../common/util';

const LAYOUT_STATE = {
  STABLE: 0,
  CALC: 1
};

export default class LayoutItem {
  static LAYOUT_STATE = LAYOUT_STATE;
  static calcLayoutSequence(items) {
    let __debug_count = 0;
    let __debug_max = 0xffff;
    let idx = 0;
    let sequences = new Array(items.length);
    while(__debug_count++ < __debug_max) {
      let continueLoop = false;
      for(let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.layoutState === LAYOUT_STATE.STABLE) {
          continue;
        } else {
          continueLoop = true;
        }
        let waitForDependence = false;
        let k;
        for(k = 0; k < item.dependencies.length; k++) {
          if (item.dependencies[k].layoutState !== LAYOUT_STATE.STABLE) {
            waitForDependence = true;
            break;
          }
        }
        if (waitForDependence) {
          continue;
        }
        sequences[idx++] = item;
        item.layoutState = LAYOUT_STATE.STABLE;
        for(k = 0; k < item.dependents.length; k++) {
          item.dependents[k].layoutState = LAYOUT_STATE.CALC;
        }
      }
      if (!continueLoop) {
        break;
      }
    }

    if (__debug_count >= __debug_max) {
      throw new Error('已达到布局算法的最大迭代次数但布局仍未稳定结束, 可能已遭遇循环引用');
    }

    return sequences;
  }
  constructor() {
    // 依赖关系
    this.dependencies = [];
    this.dependents = [];
    this.layoutState = LAYOUT_STATE.STABLE;
  }
  addDependence(item) {
    pushIfNeed(this.dependencies, item);
  }
  addDependent(item) {
    pushIfNeed(this.dependents, item);
  }
  hasDependence(item) {
    return this.dependencies.indexOf(item) >= 0;
  }
  checkDeepDependence(item, deeps) {
    let i = this.dependencies.indexOf(item);
    if (i >= 0) {
      deeps.push(i);
      return true;
    } else if (this.dependencies.length > 0) {
      for(i = 0; i < this.dependencies.length; i++) {
        deeps.push(i);
        if (this.dependencies[i].checkDeepDependence(item, deeps)) {
          return true;
        }
        deeps.pop();
      }
    }
    return false;
  }
  hasDependent(panel) {
    return this.dependents.indexOf(panel) >= 0;
  }
  removeDependent(panel) {
    removeIfNeed(this.dependents, panel);
  }
}