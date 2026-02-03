import {RdmCommandClass} from './constants';
/**
 * Convenience helpers for common RDM GET/SET requests.
 * @module artnet/rdm/helpers
 */
import type {RdmRequest, RdmResponse} from './types';
import type {RdmTransport, RdmTransportOptions} from './transport';
import type {UID} from './uid';

export type RdmRequestOptions = {
    sourceUid: UID;
    transactionNumber?: number;
    portId?: number;
    subDevice?: number;
};

export function buildGetRequest(
    destinationUid: UID,
    pid: number,
    options: RdmRequestOptions,
    parameterData?: Buffer,
): RdmRequest {
    return {
        destinationUid,
        sourceUid: options.sourceUid,
        transactionNumber: options.transactionNumber ?? 0,
        portId: options.portId ?? 1,
        subDevice: options.subDevice ?? 0,
        commandClass: RdmCommandClass.GET_COMMAND,
        pid,
        parameterData,
    };
}

export function buildSetRequest(
    destinationUid: UID,
    pid: number,
    options: RdmRequestOptions,
    parameterData?: Buffer,
): RdmRequest {
    return {
        destinationUid,
        sourceUid: options.sourceUid,
        transactionNumber: options.transactionNumber ?? 0,
        portId: options.portId ?? 1,
        subDevice: options.subDevice ?? 0,
        commandClass: RdmCommandClass.SET_COMMAND,
        pid,
        parameterData,
    };
}

export async function sendGet(
    transport: RdmTransport,
    destinationUid: UID,
    pid: number,
    options: RdmRequestOptions,
    transportOptions?: RdmTransportOptions,
): Promise<RdmResponse | null> {
    const request = buildGetRequest(destinationUid, pid, options);
    return transport.send(request, transportOptions);
}

export async function sendSet(
    transport: RdmTransport,
    destinationUid: UID,
    pid: number,
    options: RdmRequestOptions,
    parameterData?: Buffer,
    transportOptions?: RdmTransportOptions,
): Promise<RdmResponse | null> {
    const request = buildSetRequest(destinationUid, pid, options, parameterData);
    return transport.send(request, transportOptions);
}
