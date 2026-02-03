import {DMXController} from '../core';
/**
 * Fixture wrapper that binds a plugin to a universe and DMX address.
 * @module fixtures/Fixture
 */
import {FixtureModelPlugin, FixtureState} from './types';

export class Fixture {
    private state: FixtureState = {};

    constructor(
        private readonly dmx: DMXController,
        private readonly plugin: FixtureModelPlugin,
        private readonly universe: number,
        private readonly address: number,
        private readonly personalityId: string,
    ) {
        if (address < 1 || address > 512) {
            throw new RangeError(`Address must be 1-512, got ${address}`);
        }
    }

    /**
     * Merge the given state into the current fixture state.
     */
    public set(next: FixtureState): void {
        this.state = {...this.state, ...next};
    }

    /**
     * Render the fixture into the DMX universe frame buffer.
     */
    public render(nowMs?: number): void {
        const u = this.dmx.universe(this.universe);
        const base = this.address - 1;
        this.plugin.encode({
            personalityId: this.personalityId,
            state: this.state,
            ctx: {base, frame: u.data, nowMs},
        });
        u.markDirty();
    }
}
