import fs from 'node:fs';
import { KeyValues } from '../src';

const defaultOptions: Options = {
  atomicSave: true,
  dir: 'localdb',
  fileName: 'keyvalues.json',
  prettify: false,
  numSpaces: 2,
};

const options: Options = {
  atomicSave: false,
  dir: 'localdb/data',
  fileName: 'settings.json',
  prettify: true,
  numSpaces: 4,
};

const complex = {
  name: 'complex',
  type: 'object',
  properties: {
    height: 20,
    width: 20,
  },
};

const arrString = ['Teste1', 'Teste2'];

interface IPerson {
  name: string;
  age: number;
}

const person: IPerson = {
  name: 'John Doe',
  age: 30,
};

const persons: IPerson[] = [
  { name: 'John Doe', age: 30 },
  { name: 'Jane Doe', age: 33 },
];

// const t: IPerson = JSON.parse(p.toString());
// console.log(JSON.stringify(p.toString()));
// console.log('age', t.age);

const deleteFiles = () => {
    //delete json file
    const kvs = new KeyValues(options);
    if (fs.existsSync(kvs.file())) {
      fs.unlinkSync(kvs.file());
    }

    const kvsDefault = new KeyValues(defaultOptions);
    if (fs.existsSync(kvsDefault.file())) {
      fs.unlinkSync(kvsDefault.file());
    }
};

describe('KeyValues Default Test', () => {
  let kvs: KeyValues;

  beforeAll(() => {
    deleteFiles();

    kvs = new KeyValues(options);
  });

  afterAll(() => {
    // deleteFiles();
  });

  // test('test set symbol', () => {
  //   const symbol = Symbol()
  //   kvs.setSync('person', symbol)
  // })

  // Returns a string representing the path to the json file.
  it('should return the default path to the json file', () => {
    const keyValues = new KeyValues();
    const filePath = keyValues.file();
    // expect(filePath).toMatch(/\.json$/);
    expect(filePath).toBe('localdb\\keyvalues.json');
  });

  it('should reset options object to defaultOptions', () => {
    const keyValues = new KeyValues(options);
    keyValues.reset();
    expect(keyValues['options']).toEqual(defaultOptions);
  });

  it('test set/get property async', async () => {
    await kvs.set({ propAsync: true });
    expect(await kvs.get('propAsync')).toBeTruthy();
  });

  it('test set/get property', () => {
    kvs.setSync({ prop: false });
    expect(kvs.getSync('prop')).toBeFalsy();
  });

  it('test set/get string async', async () => {
    await kvs.set('stringAsync', 'start');
    expect(await kvs.get('stringAsync')).toBe('start');
  });

  it('test set/get string', () => {
    kvs.setSync('string', 'end');
    expect(kvs.getSync('string')).toBe('end');
  });

  it('test set/get boolean async', async () => {
    await kvs.set('booleanAsync', true);
    expect(await kvs.get('booleanAsync')).toBeTruthy();
  });

  it('test set/get boolean', () => {
    kvs.setSync('boolean', false);
    expect(kvs.getSync('boolean')).toBeFalsy();
  });

  it('test set/get number async', async () => {
    await kvs.set('numberAsync', 2024);
    expect(await kvs.get('numberAsync')).toBe(2024);
  });

  it('test set/get decimal', () => {
    kvs.setSync('decimal', 2024.5);
    expect(kvs.getSync<number>('decimal')).toBeGreaterThanOrEqual(2024.5);
  });

  it('test set/get null async', async () => {
    await kvs.set('nullAsync', null);
    expect(await kvs.get('nullAsync')).toBeNull();
  });

  it('test set/get of null', () => {
    kvs.setSync<null>('null', null);
    expect(kvs.getSync<null>('null')).toBeNull();
  });

  it('test set/get complex object', () => {
    kvs.setSync('complex', complex);
    const r = kvs.getSync('complex');
    expect(typeof r).toEqual(typeof complex);
  });

  it('test get of object complex', () => {
    const o = kvs.getSync<typeof complex>('complex');
    expect(o.properties.height).toEqual(20);
  });

  it('test get<number> object.property.property', () => {
    const r = kvs.getSync<number>('complex.properties.width');
    expect(r).toEqual(20);
  });

  it('test get object.property', () => {
    const r = kvs.getSync<string>('complex.name');
    expect(r).toEqual('complex');
  });

  it('test set/get of interfae', () => {
    kvs.setSync<IPerson>('person', person);
    const r = kvs.getSync<IPerson>('person');
    expect(r.name).toEqual('John Doe');
  });

  it('test set/get of array map object', () => {
    const mapPerson = persons.map((person) => ({ ...person }));
    kvs.setSync('persons', mapPerson);
    const r = kvs.getSync<IPerson[]>('persons')!;
    expect(r[1].name).toEqual('Jane Doe');
  });

  it('test get of string (person[1].name)', () => {
    const r = kvs.getSync<string>('persons[1].name');
    expect(r).toEqual('Jane Doe');
  });

  it('test get of Record<string, string>(persons[1])', () => {
    const r = kvs.getSync<Record<string, string>>('persons[1]')!;
    expect(r['age']).toEqual(33);
  });

  it('test set/get of array object', () => {
    kvs.setSync('persons_index', [{ ...persons }]);
    const r = kvs.getSync<IPerson[]>('persons_index')!;
    expect(r).toStrictEqual([{ ...persons }]);
  });

  it('test set/get of array string', () => {
    kvs.setSync('array', arrString);
    const r = kvs.getSync<string[]>('array');
    expect(r).toStrictEqual(arrString);
  });

  it('test get undefined value', () => {
    const r = kvs.getSync('undefined');
    expect(r).toBeUndefined();
  });

  it('test change value', () => {
    kvs.setSync('string', 'change value');
    const r = kvs.getSync('string');
    expect(r).toBe('change value');
  });

  it('test get all async', async () => {
    const r = await kvs.get();
    expect(r).toBeDefined();
  });

  it('test get all', () => {
    const r = kvs.getSync();
    expect(r).toBeDefined();
  });

  it('test has propertie async', async () => {
    const r = await kvs.has('string');
    expect(r).toBeTruthy();
  });

  it('test unset propertie async', async () => {
    await kvs.unset('string');
    const r = await kvs.has('string');
    expect(r).toBeFalsy();
  });

  it('test has propertie', () => {
    expect(kvs.hasSync('complex')).toBeTruthy();
  });

  it('test unset propertie', () => {
    kvs.unsetSync('complex');
    expect(kvs.hasSync('complex')).toBeFalsy();
  });

  it('test has undefined propertie', () => {
    expect(kvs.hasSync('undefined')).toBeFalsy();
  });

  it('test unset undefined propertie', () => {
    expect(kvs.unsetSync('undefined')).toBeFalsy();
  });

  it('test unset/get ', () => {
    kvs.unsetSync('boolean');
    expect(kvs.getSync('boolean')).toBeUndefined();
  });

  it('test unsetAll/get all async', async () => {
    await kvs.unset();
    expect(kvs.getSync()).toEqual({});
  });

  it('test unsetAll/get all', () => {
    kvs.setSync('novo_item', true);
    kvs.unsetSync();
    expect(kvs.getSync()).toEqual({});
  });
});
