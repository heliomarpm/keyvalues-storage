/**
 * ANTES DE EXECUTAR ESSE ROTEIRO EXECUTE OS COMANDOS ABAIXO
 *
 * npm run build
 * npm link @heliomarpm/kvs
*/
import { KeyValues } from "@heliomarpm/kvs";

describe('npm link @heliomarpm/kvs', () => {
    let kvs: KeyValues;

    beforeEach(() => {
        kvs = new KeyValues();
    });

    // Tests that the set method sets the value of a key
    it('should set & get async', async () => {
        await kvs.set('key', 'Test Async');
        const res = await kvs.get('key')
        expect(res).toBe('Test Async')
    });

    it('should set & get sync', () => {
        kvs.setSync('key', 'Test Sync');
        const res = kvs.getSync('key')
        expect(res).toBe('Test Sync')
    });

    it('shold unset', () => {
        kvs.unsetSync()
        const res = kvs.getSync('key')
        expect(res).toBeUndefined()
    })
});

