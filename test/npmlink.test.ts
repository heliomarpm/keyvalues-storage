/**
 * ANTES DE EXECUTAR ESSE ROTEIRO EXECUTE OS COMANDOS ABAIXO
 *
 * npm run build
 * npm link @helomarpm/kvs
*/
import { KeyValues } from "@heliomarpm/kvs";

const kvs = new KeyValues();

describe('npm link @heliomarpm/kvs', () => {

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

