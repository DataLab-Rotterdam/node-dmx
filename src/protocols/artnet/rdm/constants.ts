/**
 * RDM constants (ANSI E1.20).
 * @module artnet/rdm/constants
 *
 * Spec reference:
 * - ANSI E1.20 RDM
 *   https://getdlight.com/media/kunena/attachments/42/ANSI_E1-20_2010.pdf
 */
export const RDM_START_CODE = 0xcc;
export const RDM_SUB_START_CODE = 0x01;

export const RDM_MIN_MESSAGE_LENGTH = 24;
export const RDM_MIN_BYTES = 26;
export const RDM_MAX_PDL = 231;

export enum RdmCommandClass {
    DISCOVERY_COMMAND = 0x10,
    DISCOVERY_COMMAND_RESPONSE = 0x11,
    GET_COMMAND = 0x20,
    GET_COMMAND_RESPONSE = 0x21,
    SET_COMMAND = 0x30,
    SET_COMMAND_RESPONSE = 0x31,
}

export enum RdmResponseType {
    ACK = 0x00,
    ACK_TIMER = 0x01,
    NACK_REASON = 0x02,
    ACK_OVERFLOW = 0x03,
}

export const PIDS = {
    DISC_UNIQUE_BRANCH: 0x0001,
    DISC_MUTE: 0x0002,
    DISC_UN_MUTE: 0x0003,
    DEVICE_INFO: 0x0060,
    DEVICE_MODEL_DESCRIPTION: 0x0080,
    MANUFACTURER_LABEL: 0x0081,
    DMX_START_ADDRESS: 0x00f0,
    IDENTIFY_DEVICE: 0x1000,
    QUEUED_MESSAGE: 0x0020,
} as const;
