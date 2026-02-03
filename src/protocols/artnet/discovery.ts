/**
 * Art-Net 4 node discovery via ArtPoll/ArtPollReply.
 * @module artnet/discovery
 *
 * Spec reference:
 * - Art-Net 4 Specification (OpPoll, OpPollReply)
 *   https://art-net.org.uk/downloads/art-net.pdf
 */
import {createSocket, type Socket} from 'dgram';
import {EventEmitter} from 'events';
import {ARTNET_PORT} from './constants';
import {buildArtPoll, type ArtPollOptions, parseArtPollReply, type ArtPollReply} from './packet';

export type ArtNetDiscoveryOptions = {
    timeoutMs?: number;
    bindAddress?: string;
    port?: number;
};

export interface ArtNetDiscoveryEvents {
    reply: [ArtPollReply];
    error: [Error];
}

export class ArtNetDiscovery extends EventEmitter<ArtNetDiscoveryEvents> {
    private readonly socket: Socket;

    constructor(options: ArtNetDiscoveryOptions = {}) {
        super();
        this.socket = createSocket('udp4');
        this.socket.on('error', (err) => this.emit('error', err));
        if (options.bindAddress) {
            this.socket.bind({address: options.bindAddress});
        }
        this.socket.setBroadcast(true);
        this.socket.on('message', (msg) => {
            const reply = parseArtPollReply(msg);
            if (reply) this.emit('reply', reply);
        });
    }

    /**
     * Send a poll and collect replies for a short timeout.
     */
    public async pollOnce(
        pollOptions: ArtPollOptions = {},
        options: ArtNetDiscoveryOptions = {},
    ): Promise<ArtPollReply[]> {
        const replies: ArtPollReply[] = [];
        const handler = (reply: ArtPollReply) => replies.push(reply);
        this.on('reply', handler);
        await this.sendPoll(pollOptions, options);
        const timeout = options.timeoutMs ?? 1000;
        await new Promise((resolve) => setTimeout(resolve, timeout));
        this.off('reply', handler);
        return replies;
    }

    /**
     * Send an ArtPoll packet without waiting for replies.
     */
    public async sendPoll(pollOptions: ArtPollOptions = {}, options: ArtNetDiscoveryOptions = {}): Promise<void> {
        const packet = buildArtPoll(pollOptions);
        const port = options.port ?? ARTNET_PORT;
        await new Promise<void>((resolve, reject) => {
            this.socket.send(packet, port, '255.255.255.255', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Close the UDP socket.
     */
    public close(): void {
        this.socket.close();
    }
}
