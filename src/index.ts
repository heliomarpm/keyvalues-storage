import { KeyValues } from "./keyvalues";

import { join, resolve } from 'node:path';

export function DirName(): string {
    return join(__dirname, 'db');
}

export function Resolve(): string {
    return resolve('.', 'db');
}


export function Resolve2(): string {
    return resolve('db');
}


export { KeyValues }