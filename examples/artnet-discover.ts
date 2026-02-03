import {ArtNetDiscovery} from '../src';

const discovery = new ArtNetDiscovery();

async function run(): Promise<void> {
    const nodes = await discovery.pollOnce();
    console.log(`Found ${nodes.length} Art-Net nodes`);
    for (const node of nodes) {
        console.log(`${node.ip} - ${node.shortName} - ${node.longName}`);
    }
    discovery.close();
}

void run();
