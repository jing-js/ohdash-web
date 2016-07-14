export default class Rect {
  constructor(left = 0, top = 0, width = 0, height = 0) {
    this.left = left;
    this.right = left + width;
    this.top = top;
    this.bottom = top + height;
    this.width = width;
    this.height = height;
  }
}