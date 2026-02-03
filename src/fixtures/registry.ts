/**
 * Simple in-memory fixture registry.
 * @module fixtures/registry
 */
import {FixtureIdentity, FixtureModelPlugin, FixtureRegistry} from './types';

export class InMemoryFixtureRegistry implements FixtureRegistry {
    private readonly plugins: FixtureModelPlugin[] = [];

    add(plugin: FixtureModelPlugin): void {
        this.plugins.push(plugin);
    }

    find(identity: FixtureIdentity): FixtureModelPlugin | undefined {
        return this.plugins.find((plugin) => plugin.match(identity));
    }

    all(): FixtureModelPlugin[] {
        return [...this.plugins];
    }
}
