import { KeyValues } from '../src'

const kvs = new KeyValues({ prettify: true });

const complex = {
    name: 'complex',
    type: 'object',
    properties: {
        height: 20,
        width: 20
    }
}

const arrString = [
    "Teste1",
    "Teste2",
]

interface IPerson {
    name: string;
    age: number;
}

const persons: IPerson[] = [
    { name: 'John Doe', age: 30 },
    { name: 'Jane Doe', age: 33 }
]

const r = kvs.getSync<string>('persons[1].name');

// const t: IPerson = JSON.parse(p.toString());
// console.log(JSON.stringify(p.toString()));
// console.log('age', t.age);

// test('test set symbol', () => {
//   const symbol = Symbol()
//   kvs.setSync('symbol', symbol)
// })

test('test set async', async () => {
    await kvs.set('startAsync', true);
})

test('test set string', () => {
    kvs.setSync('s', 'Hello World!')
})

test('test set number', () => {
    kvs.setSync('n', 2021)
})

test('test set boolean', () => {
    kvs.setSync('b', true)
})

test('test set null', () => {
    kvs.setSync('null', null)
})

test('test set of complex object', () => {
    kvs.setSync('complex', complex)
})

test('test set of array string', () => {
    kvs.setSync('array', arrString)
})

test('test set of array object', () => {
    // kvs.setSync('persons', [{ ...persons }]);
    const mapPerson = persons.map(person => ({ ...person }));
    kvs.setSync('persons', mapPerson);
})

test('test get string', () => {
    const r = kvs.getSync('s')
    expect(r).toBe('Hello World!')
})

test('test get number', () => {
    const r = kvs.getSync('n')
    expect(r).toBe(2021)
})

test('test get boolean', () => {
    const r = kvs.getSync('b')
    expect(r).toBeTruthy()
})

test('test get of object complex', () => {
    const o = kvs.getSync<typeof complex>('complex')
    expect(o.name).toEqual("complex")
})

test('test get object.property', () => {
    const r = kvs.getSync<string>('complex.name')
    expect(r).toEqual("complex")
})

test('test get object.property.property', () => {
    const r = kvs.getSync<number>('complex.properties.width')
    expect(r).toEqual(20)
})

test('test get persons', () => {
    const r: IPerson[] = kvs.getSync<[]>('persons')!;
    expect(r[0].name).toEqual('John Doe');
})

test('test get person name', () => {
    const r = kvs.getSync<string>('persons[1].name');
    expect(r).toEqual('Jane Doe');
})

test('test get person age', () => {
    const r = kvs.getSync<Record<string, string>>('persons[1]')!;
    expect(r['age']).toEqual(33);
})

test('test has propertie `null`', () => {
    const r = kvs.hasSync('null')
    expect(r).toBeTruthy()
})

test('test get null value', () => {
    const r = kvs.getSync('null')
    expect(r).toBeNull()
})

test('test get undefined value', () => {
    const r = kvs.getSync('undefined')
    expect(r).toBeUndefined()
})

test('test change value', () => {
    kvs.setSync('s', 'change value')
    const r = kvs.getSync('s')
    expect(r).toBe('change value')
})

test('test unset', () => {
  kvs.unsetSync('a')
  const r = kvs.getSync('a')
  expect(r).toBeUndefined()
})

test('test unsetAll', () => {
  kvs.unsetSync()
  const r = kvs.getSync('b')
  expect(r).toBeUndefined()
})
