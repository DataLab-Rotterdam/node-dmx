import {ArtNetRdmClient} from '../src';

async function run(): Promise<void> {
    const rdm = new ArtNetRdmClient({host: '192.168.0.10'});
    const uids = await rdm.getTod(1);
    console.log('ToD UIDs:', uids);
    rdm.close();
}

void run();
