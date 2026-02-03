/**
 * RDM UID helpers.
 * @module artnet/rdm/uid
 *
 * Spec reference:
 * - ANSI E1.20 RDM (UID structure)
 *   https://getdlight.com/media/kunena/attachments/42/ANSI_E1-20_2010.pdf
 */
export type UID = {
    manufacturerId: number;
    deviceId: number;
};

export const UID_MIN: UID = {manufacturerId: 0x0000, deviceId: 0x00000000};
export const UID_MAX: UID = {manufacturerId: 0xffff, deviceId: 0xffffffff};

export function uidToBuffer(uid: UID): Buffer {
    const buf = Buffer.alloc(6);
    buf.writeUInt16BE(uid.manufacturerId & 0xffff, 0);
    buf.writeUInt32BE(uid.deviceId >>> 0, 2);
    return buf;
}

export function uidFromBuffer(buf: Buffer, offset = 0): UID {
    if (buf.length < offset + 6) {
        throw new RangeError('Buffer too short to read UID');
    }
    return {
        manufacturerId: buf.readUInt16BE(offset),
        deviceId: buf.readUInt32BE(offset + 2),
    };
}

export function uidToString(uid: UID): string {
    const manu = uid.manufacturerId.toString(16).padStart(4, '0');
    const dev = uid.deviceId.toString(16).padStart(8, '0');
    return `${manu}:${dev}`;
}

export function uidFromString(text: string): UID {
    const parts = text.split(':');
    if (parts.length !== 2) {
        throw new Error('UID must be formatted as "mmmm:dddddddd"');
    }
    const manufacturerId = parseInt(parts[0], 16);
    const deviceId = parseInt(parts[1], 16);
    if (!Number.isInteger(manufacturerId) || !Number.isInteger(deviceId)) {
        throw new Error('UID contains invalid hex values');
    }
    return {manufacturerId, deviceId};
}

export function uidCompare(a: UID, b: UID): number {
    if (a.manufacturerId !== b.manufacturerId) {
        return a.manufacturerId - b.manufacturerId;
    }
    return a.deviceId - b.deviceId;
}

export function uidToBigInt(uid: UID): bigint {
    return (BigInt(uid.manufacturerId) << 32n) | BigInt(uid.deviceId >>> 0);
}

export function uidFromBigInt(value: bigint): UID {
    const manufacturerId = Number((value >> 32n) & 0xffffn);
    const deviceId = Number(value & 0xffffffffn);
    return {manufacturerId, deviceId};
}

export function uidMidpoint(lower: UID, upper: UID): UID {
    const low = uidToBigInt(lower);
    const high = uidToBigInt(upper);
    if (high < low) {
        throw new RangeError('Upper UID must be >= lower UID');
    }
    const mid = (low + high) / 2n;
    return uidFromBigInt(mid);
}

export function uidInRange(uid: UID, lower: UID, upper: UID): boolean {
    const value = uidToBigInt(uid);
    const low = uidToBigInt(lower);
    const high = uidToBigInt(upper);
    return value >= low && value <= high;
}
