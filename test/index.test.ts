import { KeyValues } from '../src'

const kvs = new KeyValues();

const complex = {
  name: 'complex',
  type: 'object',
  properties: {
    height: 20,
    width: 20
  }
}

test('test set string', () => {
  kvs.setSync('s', 'Hello World!')
})

test('test set number', () => {
  kvs.setSync('n', 2021)
})

test('test set boolean', () => {
  kvs.setSync('b', true)
})

test('test set of complex object', () => {  
  kvs.setSync('complex', complex)
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

test('test get of object complex', () => {
  const o = kvs.getSync<typeof complex>('complex')
  expect(o.name).toEqual("complex")
})

test('test get object.property', () => {
  const o = kvs.getSync<string>('complex.name')
  expect(o).toEqual("complex")
})

test('test get object.property.property', () => {
  const o = kvs.getSync<number>('complex.properties.width')
  expect(o).toEqual(20)
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
