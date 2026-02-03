/**
 * Fixture plugin types.
 * @module fixtures/types
 */
import type {UID as RdmUID} from '../protocols/artnet/rdm/uid';

export type FixtureUID = RdmUID;

export type FixtureIdentity = {
    uid?: FixtureUID;
    manufacturerId?: number;
    modelId?: number;
    dmxAddress?: number;
};

export type FixtureState = Record<string, unknown>;

export type EncodeContext = {
    base: number;
    frame: Uint8Array;
    nowMs?: number;
};

export type DecodeContext = {
    base: number;
    frame: Uint8Array;
};

export type Personality = {
    id: string;
    name: string;
    channels: number;
};

export type FixtureModelPlugin = {
    manufacturerId?: number;
    vendor: string;
    model: string;
    personalities: Personality[];
    defaultPersonalityId: string;
    match: (id: FixtureIdentity) => boolean;
    encode: (args: {
        personalityId: string;
        state: FixtureState;
        ctx: EncodeContext;
    }) => void;
    decode?: (args: {personalityId: string; ctx: DecodeContext}) => FixtureState;
    rdm?: {
        decodePid?: (pid: number, data: Uint8Array) => unknown;
        encodePid?: (pid: number, value: unknown) => Uint8Array;
    };
};

export type FixtureRegistry = {
    add(plugin: FixtureModelPlugin): void;
    find(identity: FixtureIdentity): FixtureModelPlugin | undefined;
    all(): FixtureModelPlugin[];
};
