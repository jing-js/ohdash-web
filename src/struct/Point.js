export default class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
  }
  assign(anotherPoint) {
    this.x = anotherPoint.x;
    this.y = anotherPoint.y;
  }
}