import {RdmCommandClass, RdmResponseType} from './constants';
import {UID} from './uid';

/**
 * RDM request/response types.
 * @module artnet/rdm/types
 *
 * Spec reference:
 * - ANSI E1.20 RDM
 *   https://getdlight.com/media/kunena/attachments/42/ANSI_E1-20_2010.pdf
 */
export type RdmRequest = {
    destinationUid: UID;
    sourceUid: UID;
    transactionNumber: number;
    portId: number;
    messageCount?: number;
    subDevice?: number;
    commandClass: RdmCommandClass;
    pid: number;
    parameterData?: Buffer;
};

export type RdmResponse = {
    destinationUid: UID;
    sourceUid: UID;
    transactionNumber: number;
    responseType: RdmResponseType;
    messageCount: number;
    subDevice: number;
    commandClass: RdmCommandClass;
    pid: number;
    parameterData: Buffer;
};

export type RdmDiscoveryResult = {
    uid: UID;
    muted: boolean;
};
