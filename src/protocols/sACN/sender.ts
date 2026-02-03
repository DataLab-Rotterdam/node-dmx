/**
 * sACN (E1.31) sender.
 * @module sacn/sender
 */
import {type Socket, createSocket} from 'dgram';
import {EventEmitter} from 'events';
import {multicastGroup} from './util';
import {type Options, Packet} from './packet';

export type SenderConfiguration = {
    universe: number;
    port?: number;
    reuseAddr?: boolean;
    refreshRate?: number;
    defaultPacketOptions?: Partial<
        Pick<Options, 'cid' | 'sourceName' | 'priority' | 'useRawDmxValues'>
    >;
    iface?: string;
    useUnicastDestination?: string;
};

export interface SenderEvents {
    changedResendStatus: [success: boolean];
    error: [error: Error];
}

export class Sender extends EventEmitter<SenderEvents> {
    private readonly socket: Socket;
    private readonly port: number;
    public readonly universe: number;
    private readonly destinationIp: string;
    private readonly defaultPacketOptions: Partial<Options>;
    public readonly refreshRate: number;

    private sequence = 0;
    public resendStatus = false;
    private loopId: NodeJS.Timeout | undefined;

    private latestPacketOptions: Omit<Options, 'sequence' | 'universe'> | undefined;

    constructor(config: SenderConfiguration) {
        super();

        const {
            universe,
            port = 5568,
            reuseAddr = false,
            refreshRate = 0,
            defaultPacketOptions = {},
            iface,
            useUnicastDestination,
        } = config;

        if (universe < 1 || universe > 63999) {
            throw new RangeError('Universe must be between 1 and 63999 (inclusive).');
        }

        this.universe = universe;
        this.port = port;
        this.destinationIp = useUnicastDestination || multicastGroup(universe);
        this.defaultPacketOptions = defaultPacketOptions;
        this.refreshRate = refreshRate;

        this.socket = createSocket({ type: 'udp4', reuseAddr });

        this.socket.bind(port, () => {
            if (iface) {
                try {
                    this.socket.setMulticastInterface(iface);
                } catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    console.warn(`Failed to set multicast interface "${iface}":`, message);
                }
            }
        });

        if (refreshRate > 0) {
            const interval = 1000 / refreshRate;
            this.loopId = setInterval(() => this.reSend(), interval);
        }
    }

    public async send(packet: Omit<Options, 'sequence' | 'universe'>): Promise<void> {
        const finalPacket: Options = {
            ...this.defaultPacketOptions,
            ...packet,
            universe: this.universe,
            sequence: this.sequence,
        };

        this.latestPacketOptions = {...packet};
        this.sequence = (this.sequence + 1) % 256;

        const {buffer} = new Packet(finalPacket);
        await this.sendBuffer(buffer);
    }

    public async sendRaw(
        payload: Buffer | Uint8Array,
        overrides: Omit<Options, 'sequence' | 'universe' | 'payload'> = {},
    ): Promise<void> {
        const finalPacket: Options = {
            ...this.defaultPacketOptions,
            ...overrides,
            universe: this.universe,
            sequence: this.sequence,
            payload,
        };

        this.latestPacketOptions = {payload, ...overrides};
        this.sequence = (this.sequence + 1) % 256;

        const {buffer} = new Packet(finalPacket);
        await this.sendBuffer(buffer);
    }

    private async reSend(): Promise<void> {
        if (!this.latestPacketOptions) return;

        try {
            await this.send(this.latestPacketOptions);
            this.updateResendStatus(true);
        } catch (err) {
            this.updateResendStatus(false);
            this.emit('error', err as Error);
        }
    }

    private sendBuffer(buffer: Buffer): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket.send(buffer, this.port, this.destinationIp, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    private updateResendStatus(success: boolean): void {
        if (success !== this.resendStatus) {
            this.resendStatus = success;
            this.emit('changedResendStatus', success);
        }
    }

    public close(): this {
        if (this.loopId) {
            clearInterval(this.loopId);
            this.loopId = undefined;
        }
        this.socket.close();
        return this;
    }
}
