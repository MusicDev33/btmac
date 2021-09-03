const GameController = require('./controller');
const bot = require('robotjs');
const KeyMap = require('./keymap');

const locks = {
  shift: false,
  singleText: false,
  prevKey: false,
  spaceLock: false,
  enter: false,
  tab: false
};

let prevKey = '';

let shiftMode = false;

// modes: down, up, left, right
let mode = '';
let lTrigger = false;
let rTrigger = false;
let rBumper = false;

let modeTriggers = ['D_PAD_LEFT', 'D_PAD_RIGHT', 'D_PAD_DOWN', 'D_PAD_UP'];
let inputTriggers = ['A', 'B', 'Y', 'X'];

let lTriggerTimer;
let modeTimer;
let rTriggerTimer;

let rBumperTimer;

(async () => {
    const gameController = new GameController();
    await gameController.init();

    console.log('Ready');

    gameController.on('button', (btn) => {

      console.log(mode);

      const input = btn.replaceAll('"', '');

      if (lTrigger && input === 'TRIGGER_RIGHT' && !locks.spaceLock) {
        bot.keyTap('space');
        locks.spaceLock = true;
        setTimeout(() => {locks.spaceLock = false}, 100);
        return;
      }

      if (input === 'A' && !mode.length && !locks.singleText && rBumper) {
        bot.mouseClick();
        return;
      }

      if (input === 'B' && !mode.length && !locks.singleText && rTrigger) {
        bot.keyTap('backspace');
        locks.singleText = true;
        setTimeout(() => {locks.singleText = false}, 50);

        return;
      }

      if (input === 'Y' && !mode.length && !locks.enter && rTrigger) {
        bot.keyTap('enter');
        locks.enter = true;
        setTimeout(() => {locks.enter = false}, 100);

        return;
      }

      if (input === 'X' && !mode.length && !locks.tab && rTrigger) {
        bot.keyTap('tab');
        locks.tab = true;
        setTimeout(() => {locks.tab = false}, 100);

        return;
      }

      if (inputTriggers.includes(input) && mode.length && !locks.singleText) {
        locks.singleText = true;
        setTimeout(() => {locks.singleText = false}, 150);

        if (lTrigger) {
          const inputCode = `lt-${mode}-${input.toLowerCase()}`;

          bot.typeString(KeyMap[inputCode]);
          return;
        }

        const inputCode = `${mode}-${input.toLowerCase()}`;

        bot.typeString(KeyMap[inputCode]);
        return;
      }

      if (modeTriggers.includes(input)) {
        const newMode = input.split('_')[2].toLowerCase();
        mode = newMode;

        if (modeTimer) {
          clearTimeout(modeTimer);
        }

        modeTimer = setTimeout(() => {
          mode = '';
        }, 30, 'key-mode');
        return;
      }

      if (input === 'TRIGGER_LEFT') {
        lTrigger = true;
        if (lTriggerTimer) {
          clearTimeout(lTriggerTimer);
        }

        lTriggerTimer = setTimeout(() => {
          lTrigger = false;
        }, 50, 'l-trigger-mode');
        return;
      }

      if (input === 'TRIGGER_RIGHT') {
        rTrigger = true;
        if (rTriggerTimer) {
          clearTimeout(rTriggerTimer);
        }

        rTriggerTimer = setTimeout(() => {
          rTrigger = false;
        }, 50, 'r-trigger-mode');
        return;
      }

      if (input === 'BUMPER_RIGHT') {
        rBumper = true;
        if (rBumperTimer) {
          clearTimeout(rBumperTimer);
        }

        rBumperTimer = setTimeout(() => {
          rBumper = false;
        }, 50, 'l-bumper-mode');
        return;
      }

      if (input === 'THUMBSTICK_L_CLICK' && locks.shift == false) {
        shiftMode = !shiftMode;
        locks.shift = true;

        const setLock = () => {
          locks.shift = false;
        };

        setTimeout(setLock, 250);
        return;
      }



      console.log(input);
      console.log(`Button: ${input} pressed`);
    });

    gameController.on('thumbsticks', (val) => {
      const valData = val.replace('[', '').replace(']', '').split(',').map(num => {
        return parseFloat(num);
      });

      const multiplier = 10;
      const scrolltiplier = 15;

      const dx = valData[0] * multiplier;
      const dy = valData[1] * multiplier;

      const dScrollX = valData[2] * scrolltiplier;
      const dScrollY = 0 - valData[3] * scrolltiplier;

      const currentMouseData = bot.getMousePos();

      const mouseX = currentMouseData.x;
      const mouseY = currentMouseData.y;
      
      bot.moveMouse(mouseX + dx, mouseY + dy);
      bot.scrollMouse(0, dScrollY);
      
    });
})();