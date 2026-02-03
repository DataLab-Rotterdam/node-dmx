/**
 * RDM transport interface abstraction (used by discovery/helpers).
 * @module artnet/rdm/transport
 */
import type {UID} from './uid';
import type {RdmRequest, RdmResponse} from './types';

export type RdmTransportOptions = {
    timeoutMs?: number;
};

export type DiscoveryUniqueBranchResult = {
    responses: Buffer[];
};

export interface RdmTransport {
    send(request: RdmRequest, options?: RdmTransportOptions): Promise<RdmResponse | null>;
    sendDiscoveryUniqueBranch(
        lower: UID,
        upper: UID,
        options?: RdmTransportOptions,
    ): Promise<DiscoveryUniqueBranchResult>;
    sendMute?(uid: UID, options?: RdmTransportOptions): Promise<boolean>;
    sendUnMute?(uid: UID, options?: RdmTransportOptions): Promise<boolean>;
}
