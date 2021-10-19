export function isObject(data) {
  return Array.isArray(data) || Object.prototype.toString.call(data) === '[object Object]'
}
export function isString(key) {
  return typeof key === 'string'
}
export function isIntegerKey(key) {
  return  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key
}
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn(target,key) {
  return hasOwnProperty.call(target,key)
}