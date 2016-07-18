export default class EventEmitter {
  constructor() {
    this._listeners = new Map();
  }
  on(eventName, handler) {
    let arr = this._listeners.get(eventName);
    if (!arr) {
      arr = [];
      this._listeners.set(eventName, arr);
    }
    if (arr.indexOf(handler) < 0) {
      arr.push(handler);
    }
  }
  emit(eventName, ...args) {
    let arr = this._listeners.get(eventName);
    if (!arr) {
      return;
    }
    arr.forEach(handler => {
      handler(...args);
    });
  }
  off(eventName, handler) {
    let arr = this._listeners.get(eventName);
    if (!arr) {
      return;
    }
    if (!handler) {
      arr.length = 0;
    } else {
      let i = arr.indexOf(handler);
      if (i >= 0) {
        arr.splice(i, 1);
      }
    }
  }
}