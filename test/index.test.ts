import { KeyValues } from '../src'

const kvs = new KeyValues();

test('test set string', () => {
  kvs.setSync('s', 'Hello World!')
})

test('test set number', () => {
  kvs.setSync('n', 2021)
})

test('test set boolean', () => {
  kvs.setSync('b', true)
})

test('test set object', () => {
  kvs.setSync('o', {value: "settings"})
})

test('test get string', () => {
  const s = kvs.getSync('s')
  expect(s).toBe('Hello World!')
})

test('test get number', () => {
  const n = kvs.getSync('n')
  expect(n).toBe(2021)
})

test('test get boolean', () => {
  const b = kvs.getSync('b')
  expect(b).toBeTruthy()
})

test('test get object', () => {
  const o = kvs.getSync('o')
  expect(o).toEqual({value: "settings"})
})

test('test get object.value', () => {
  const o = kvs.getSync('o.value')
  expect(o).toEqual("settings")
})

test('test get undefined value', () => {
  const u = kvs.getSync('not defined')
  expect(u).toBeUndefined()
})

test('test change value', () => {
  kvs.setSync('s', 'change value')
  const s = kvs.getSync('s')
  expect(s).toBe('change value')
})

test('test unset', () => {
  kvs.unsetSync('a')
  const a = kvs.getSync('a')
  expect(a).toBeUndefined()
})

test('test unsetAll', () => {
  kvs.unsetSync()
  const b = kvs.getSync('b')
  console.log("test unsetAll", b);
  expect(b).toBeUndefined()
})
