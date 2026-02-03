import {DMXController} from '../src';

const controller = new DMXController({protocol: 'sacn'});
const universe = controller.addUniverse(1);



let value = 0;
let direction = 1;

setInterval(async () => {
    value += direction * 5;
    if (value >= 255) {
        value = 255;
        direction = -1;
    }
    if (value <= 0) {
        value = 0;
        direction = 1;
    }

    universe.setChannel(1, value);
    await controller.flush();
}, 25);
