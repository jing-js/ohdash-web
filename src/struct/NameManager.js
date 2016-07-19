class NameManager {
  constructor() {
    this._map = new Map();
    this._maxId = 1;
    this._isFull = false;
  }
  generate() {
    let name;
    if (!this._isFull) {
      for(let i = 1; i < this._maxId; i++) {
        name = `panel_${i}`;
        if (!this._map.has(name)) {
          this._map.set(name, true);
          return name;
        }
      }
      this._isFull = true;
    }
    name = `panel_${this._maxId++}`;
    this._map.set(name, true);
    return name;
  }
  register(name) {
    if (this._map.has(name)) {
      return false;
    }
    let m = name.match(/^panel_(\d+)$/);
    if (m) {
      let n = Number(m[1]);
      if (n > this._maxId) {
        this._maxId = n;
        this._isFull = false;
      }
    }
    this._map.set(name, true);
  }
  remove(name) {
    this._map.delete(name);
    if (/^panel_(\d+)$/.test(name)) {
      this._isFull = false;
    }
  }
}

export default new NameManager();
