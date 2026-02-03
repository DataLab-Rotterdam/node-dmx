/**
 * DMX Universe container (512 channels).
 * @module core/Universe
 */
import {clampByte} from './utils';

export class Universe {
    public readonly id: number;
    public readonly data: Uint8Array;
    private dirty = false;

    constructor(id: number) {
        if (!Number.isInteger(id) || id < 1 || id > 63999) {
            throw new RangeError(`Universe must be 1-63999, got ${id}`);
        }
        this.id = id;
        this.data = new Uint8Array(512);
    }

    public setChannel(address: number, value: number): void {
        if (!Number.isInteger(address) || address < 1 || address > 512) {
            throw new RangeError(`Channel must be 1-512, got ${address}`);
        }
        this.data[address - 1] = clampByte(value);
        this.dirty = true;
    }

    public setFrame(frame: Uint8Array | Buffer): void {
        const length = Math.min(frame.length, 512);
        this.data.fill(0);
        for (let i = 0; i < length; i++) {
            this.data[i] = clampByte(frame[i] ?? 0);
        }
        this.dirty = true;
    }

    public fill(value: number): void {
        this.data.fill(clampByte(value));
        this.dirty = true;
    }

    public clear(): void {
        this.data.fill(0);
        this.dirty = true;
    }

    public markDirty(): void {
        this.dirty = true;
    }

    public consumeDirty(): boolean {
        const wasDirty = this.dirty;
        this.dirty = false;
        return wasDirty;
    }

    public isDirty(): boolean {
        return this.dirty;
    }
}
