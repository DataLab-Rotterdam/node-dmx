# node-dmx

Network DMX library for Node.js (TypeScript). It supports:
- sACN (E1.31)
- Art-Net 4
- RDM over Art-Net
- A fixture plugin system

This README is written so students can get a device running quickly and understand the basics.

**What you need**
- Node.js 18 or newer
- A DMX-over-IP device that supports sACN or Art-Net
- Your computer and the device on the same network

## Install
```bash
npm install node-dmx
```

## How DMX Works (30 seconds)
- A DMX **universe** is 512 channels.
- A **channel** value is 0 to 255.
- You update channels and then **flush** to send the frame.

## Quick Start (sACN)
Best for modern devices and multicast networks.
```ts
import {DMXController} from 'node-dmx';

const controller = new DMXController({protocol: 'sacn'});

const universe = controller.addUniverse(1);
universe.setChannel(1, 255); // channel 1 to full

await controller.flush();
controller.close();
```

## Quick Start (Art-Net)
Common in lighting networks and older devices.
```ts
import {DMXController} from 'node-dmx';

const controller = new DMXController({
  protocol: 'artnet',
  artSync: true,
  artnet: {
    host: '255.255.255.255', // broadcast
    broadcast: true,
  },
});

const universe = controller.addUniverse(1);
universe.setChannel(1, 255);

await controller.flush();
controller.close();
```

## Find Art-Net Devices (Discovery)
```ts
import {ArtNetDiscovery} from 'node-dmx';

const discovery = new ArtNetDiscovery();
const replies = await discovery.pollOnce();

for (const node of replies) {
  console.log(node.ip, node.shortName, node.longName);
}

discovery.close();
```

## RDM over Art-Net
RDM lets you query devices for information and change settings.
```ts
import {ArtNetRdmClient, RdmCommandClass, PIDS} from 'node-dmx';

const rdm = new ArtNetRdmClient({host: '192.168.0.10'});

const response = await rdm.rdmTransaction(1, {
  destinationUid: {manufacturerId: 0x7a70, deviceId: 0x00000001},
  sourceUid: {manufacturerId: 0x7a70, deviceId: 0x00000002},
  transactionNumber: 1,
  portId: 1,
  subDevice: 0,
  commandClass: RdmCommandClass.GET_COMMAND,
  pid: PIDS.DEVICE_INFO,
});

console.log(response);
rdm.close();
```

## Fixtures (Higher-Level Control)
Fixtures let you work with named channels like `r`, `g`, `b`, `dimmer`.
```ts
import {DMXController, Fixture, RGBDimmerFixture} from 'node-dmx';

const controller = new DMXController({protocol: 'sacn'});
controller.addUniverse(1);

const fixture = new Fixture(
  controller,
  RGBDimmerFixture,
  1,         // universe
  1,         // start address
  'default', // personality id
);

fixture.set({r: 255, g: 64, b: 32, dimmer: 255});
fixture.render();

await controller.flush();
```

## Examples (Runnable)
Examples are included in `examples/`:
- `examples/sacn-animate.ts`
- `examples/artnet-animate.ts`
- `examples/artnet-discover.ts`
- `examples/rdm-tod.ts`

Run one:
```bash
npx tsx examples/sacn-animate.ts
```

## API Documentation (TypeDoc)
This project uses TypeDoc. The README is used as the landing page.

Build docs:
```bash
npm run docs:build
```

Output goes to `generated/docs`.

## Troubleshooting
- Make sure your computer and device are on the same network.
- If nothing responds, try unicast by setting `artnet.host` or the sACN unicast destination.
- Some devices use a different universe numbering. Try universe 0 or 1 if unsure.

## Protocol References
- Art-Net 4: https://art-net.org.uk/downloads/art-net.pdf
- ANSI E1.31 (sACN): https://tsp.esta.org/tsp/documents/published_docs.php
- ANSI E1.20 (RDM): https://getdlight.com/media/kunena/attachments/42/ANSI_E1-20_2010.pdf
