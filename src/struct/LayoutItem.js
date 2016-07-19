import { pushIfNeed, removeIfNeed } from '../common/util';

function LayoutItem() {
  // 依赖关系
  this.dependencies = [];
  this.dependents = [];
}

LayoutItem.prototype = {
  addDependence(item) {
    pushIfNeed(this.dependencies, item);
  },
  addDependent(item) {
    pushIfNeed(this.dependents, item);
  },
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
  },
  removeDependent(panel) {
    removeIfNeed(this.dependents, panel);
  }
};

LayoutItem.calcLayoutSequence = function(items) {
  let sequences = [];
  for(let i = 0; i < items.length; i++) {
    add(sequences, items[i]);
  }

  function add(arr, it) {
    if (arr.indexOf(it) >= 0) {
      return;
    }
    let dps = it.dependencies;
    for(let i = 0; i < dps.length; i++) {
      add(arr, dps[i]);
    }
    arr.push(it);
  }
  return sequences;
};

export default LayoutItem;
