/**
 * Art-Net 4 packet builders and parsers.
 * @module artnet/packet
 *
 * Spec reference:
 * - Art-Net 4 Specification (opcode packets and field layouts)
 *   https://art-net.org.uk/downloads/art-net.pdf
 */
import {ARTNET_ID, ARTNET_PROTOCOL_VERSION, DiagnosticsPriority, OpCode} from './constants';
import {readNullTerminatedString, splitUniverseAddress} from './util';

export type ArtDmxOptions = {
    universe: number;
    sequence: number;
    physical?: number;
    data: Uint8Array | Buffer;
    length?: number;
};

export type ArtPollOptions = {
    sendDiagnostics?: boolean;
    diagnosticsUnicast?: boolean;
    sendDiagnosticsOnChange?: boolean;
    sendInputOnChange?: boolean;
    sendIeee?: boolean;
    sendNodeReportOnData?: boolean;
    priority?: DiagnosticsPriority;
};

export type ArtDiagDataOptions = {
    priority?: DiagnosticsPriority;
    message: string;
};

export type ArtTimeCode = {
    frames: number;
    seconds: number;
    minutes: number;
    hours: number;
    type: number;
};

export type ArtTrigger = {
    key: number;
    subKey: number;
    payload?: Uint8Array | Buffer;
};

export type ArtPollReply = {
    ip: string;
    port: number;
    shortName: string;
    longName: string;
    numPorts: number;
    swIn: number[];
    swOut: number[];
    nodeReport: string;
    netSwitch?: number;
    subSwitch?: number;
    status1?: number;
    status2?: number;
    status3?: number;
};

const writeHeader = (buffer: Buffer, opcode: OpCode): void => {
    buffer.write(ARTNET_ID, 0, 'ascii');
    buffer.writeUInt16LE(opcode, 8);
    buffer.writeUInt16BE(ARTNET_PROTOCOL_VERSION, 10);
};

export const buildArtPoll = (options: ArtPollOptions = {}): Buffer => {
    const buffer = Buffer.alloc(14);
    writeHeader(buffer, OpCode.OpPoll);
    let talkToMe = 0;
    if (options.sendDiagnostics) talkToMe |= 0x02;
    if (options.diagnosticsUnicast) talkToMe |= 0x04;
    if (options.sendDiagnosticsOnChange) talkToMe |= 0x08;
    if (options.sendInputOnChange) talkToMe |= 0x10;
    if (options.sendIeee) talkToMe |= 0x20;
    if (options.sendNodeReportOnData) talkToMe |= 0x40;
    buffer.writeUInt8(talkToMe, 12);
    buffer.writeUInt8(options.priority ?? DiagnosticsPriority.Low, 13);
    return buffer;
};

export const buildArtDmx = (options: ArtDmxOptions): Buffer => {
    const length = Math.min(options.length ?? options.data.length, 512);
    const buffer = Buffer.alloc(18 + length);
    writeHeader(buffer, OpCode.OpDmx);
    buffer.writeUInt8(options.sequence & 0xff, 12);
    buffer.writeUInt8(options.physical ?? 0, 13);
    const addr = splitUniverseAddress(options.universe);
    buffer.writeUInt8(addr.subUni, 14);
    buffer.writeUInt8(addr.net, 15);
    buffer.writeUInt16BE(length, 16);
    Buffer.from(options.data).copy(buffer, 18, 0, length);
    return buffer;
};

export const buildArtSync = (): Buffer => {
    const buffer = Buffer.alloc(14);
    writeHeader(buffer, OpCode.OpSync);
    buffer.writeUInt8(0, 12);
    buffer.writeUInt8(0, 13);
    return buffer;
};

export const buildArtDiagData = (options: ArtDiagDataOptions): Buffer => {
    const message = Buffer.from(options.message, 'ascii');
    const buffer = Buffer.alloc(16 + message.length + 1);
    writeHeader(buffer, OpCode.OpDiagData);
    buffer.writeUInt8(0, 12);
    buffer.writeUInt8(options.priority ?? DiagnosticsPriority.Low, 13);
    buffer.writeUInt16BE(message.length + 1, 14);
    message.copy(buffer, 16);
    buffer.writeUInt8(0, 16 + message.length);
    return buffer;
};

export const buildArtTimeCode = (timeCode: ArtTimeCode): Buffer => {
    const buffer = Buffer.alloc(19);
    writeHeader(buffer, OpCode.OpTimeCode);
    buffer.writeUInt8(0, 12);
    buffer.writeUInt8(timeCode.frames & 0xff, 13);
    buffer.writeUInt8(timeCode.seconds & 0xff, 14);
    buffer.writeUInt8(timeCode.minutes & 0xff, 15);
    buffer.writeUInt8(timeCode.hours & 0xff, 16);
    buffer.writeUInt8(timeCode.type & 0xff, 17);
    buffer.writeUInt8(0, 18);
    return buffer;
};

export const buildArtCommand = (command: string): Buffer => {
    const commandBuffer = Buffer.from(command, 'ascii');
    const buffer = Buffer.alloc(14 + commandBuffer.length + 1);
    writeHeader(buffer, OpCode.OpCommand);
    buffer.writeUInt8(0, 12);
    buffer.writeUInt8(0, 13);
    commandBuffer.copy(buffer, 14);
    buffer.writeUInt8(0, 14 + commandBuffer.length);
    return buffer;
};

export const buildArtTrigger = (trigger: ArtTrigger): Buffer => {
    const payload = trigger.payload ? Buffer.from(trigger.payload) : Buffer.alloc(0);
    const buffer = Buffer.alloc(18 + payload.length);
    writeHeader(buffer, OpCode.OpTrigger);
    buffer.writeUInt8(0, 12);
    buffer.writeUInt8(trigger.key & 0xff, 13);
    buffer.writeUInt8(trigger.subKey & 0xff, 14);
    buffer.writeUInt8(0, 15);
    buffer.writeUInt16BE(payload.length, 16);
    payload.copy(buffer, 18);
    return buffer;
};

export const parseArtPollReply = (buffer: Buffer): ArtPollReply | null => {
    if (buffer.length < 239) return null;
    const id = buffer.toString('ascii', 0, 8);
    if (id !== ARTNET_ID) return null;
    const opcode = buffer.readUInt16LE(8);
    if (opcode !== OpCode.OpPollReply) return null;
    const ip = `${buffer[10]}.${buffer[11]}.${buffer[12]}.${buffer[13]}`;
    const port = buffer.readUInt16BE(14);
    const netSwitch = buffer[18];
    const subSwitch = buffer[19];
    const status1 = buffer[23];
    const shortName = readNullTerminatedString(buffer, 26, 18);
    const longName = readNullTerminatedString(buffer, 44, 64);
    const nodeReport = readNullTerminatedString(buffer, 108, 64);
    const numPorts = buffer.readUInt16BE(172);
    const swIn = Array.from(buffer.subarray(186, 190));
    const swOut = Array.from(buffer.subarray(190, 194));
    const status2 = buffer[201];
    const status3 = buffer[211];
    return {
        ip,
        port,
        shortName,
        longName,
        nodeReport,
        numPorts,
        swIn,
        swOut,
        netSwitch,
        subSwitch,
        status1,
        status2,
        status3,
    };
};
