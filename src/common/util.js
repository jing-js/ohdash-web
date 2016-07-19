if (typeof Object.assign !== 'function') {
  Object.assign = function(org, ...dst) {
    dst.forEach(d => {
      for(var k in d) {
        org[k] = d[k];
      }
    });
  }
}

import Less from 'less';

export function parseLess(code, wrapperId) {
  if (wrapperId[0] !== '#') {
    wrapperId = '#' + wrapperId;
  }
  let lessCode = `${wrapperId} {\n${code}\n}`;
  return Less.render(lessCode).then(output => output.css);
}

let _tc = function(type, obj) {
  return typeof obj === type;
};

export const isObject = _tc.bind(null, 'object');
export const isFunction = _tc.bind(null, 'function');
export const isString = _tc.bind(null, 'string');

export function $id(id) {
  return document.getElementById(id);
}
export function appendCssStyle(css, id) {
  let $s = document.createElement('style');
  $s.textContent = css;
  if (id) {
    $s.id = id;
  }
  document.getElementsByTagName('head')[0].appendChild($s);
}

export function $remove(idOrElement) {
  if (isString(idOrElement)) {
    idOrElement = $id(idOrElement);
  }
  idOrElement.parentElement.removeChild(idOrElement);
}

export function pushIfNeed(arr, item) {
  if (arr.indexOf(item) < 0) {
    arr.push(item);
  }
}
export function removeIfNeed(arr, item) {
  let i = arr.indexOf(item);
  if (i >= 0) {
    arr.splice(i, 1);
  }
}

export function reduceFraction(numerator,denominator){
  let gcd = function gcd(a,b){
    return b ? gcd(b, a%b) : a;
  };
  gcd = gcd(numerator,denominator);
  return [numerator/gcd, denominator/gcd];
}

export function extendProto(src, dst) {
  for(let k in src.prototype) {
    console.log(k)
    if (!dst.prototype.hasOwnProperty(k)) {
      dst.prototype[k] = src.prototype[k];
    }
  }
  return src;
}