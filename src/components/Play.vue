<script setup>
import { ref, reactive, onMounted } from 'vue';
import Game from '@/models/Game.js';

const mapHeight = 540;
const mapWidth = 930;
const gapTime = 1000;

const inputValue = ref('');
const isRunning = ref(false);
const width = ref(0);
const height = ref(0);
const unitLen = ref(30);
const slimeFace = ref(0);
const slime = reactive({});
const map = reactive([]);

let gObj;
let game;
let isComplete = false;

const goBack = () => {
  window.history.back();
}

const update = () => {
  map.splice(0, map.length);
  game.getMap().forEach(e => map.push(e));
  const s = game.getSlime();
  Object.keys(s).forEach(k => slime[k] = s[k]);
}

const restart = () => {
  game = new Game(gObj);
  update();
  slimeFace.value = slime.direction * 90;
  isComplete = false;
}

const go = () => {
  game.go();
  update();

  if (game.isComplete()) {
    isComplete = true;
    setTimeout(() => {
      if (confirm('Congratulations!!! Again?'))
        restart();
      isRunning.value = false;
    }, gapTime);
  }
}

const turnRight = () => {
  game.turnRight();
  slimeFace.value += 90;
  update();
}

const turnLeft = () => {
  game.turnLeft();
  slimeFace.value -= 90;
  update();
}

const fatchGame = async uuid => {
  try {
    const response = await fetch(`${window.location.origin}/api/game/get?u=${uuid}`);
    const value = await response.json();
    return value.isSuccess ? value.game : null;
  } catch (e) {
    console.error(e);
  }
};

const setUnitLen = (row, col) => {
  const unitHeight = parseInt(mapHeight / row);
  const unitWidth = parseInt(mapHeight / col);
  return unitHeight < unitWidth ? unitHeight : unitWidth;
}

const unit2Class = unit => {
  switch (unit) {
    case Game.Unit.EMPTY:   return 'empty';
    case Game.Unit.SPACE:   return 'space';
    case Game.Unit.COIN:    return 'coin';
    default:                return 'empty';
  }
}

const inputChanged = () => {
  if (!/^[lfrLRF(*)0-9]*$/.test(inputValue.value)) {
    inputValue.value = inputValue.value.replace(/[^lrfLRF(*)0-9]/g, '');
    alert('Only L, R, F, (, ), * and digits are allowed.')
  }
}

const trans = s => {
  if (!s.length) {
    return '';
  } else if ([ 'L', 'R', 'F' ].includes(s[0])) {
    return s[0] + trans(s.slice(1));
  } else if ([ 'L', 'R', 'F' ].includes(s.slice(-1))) {
    return trans(s.slice(0, -1)) + s.slice(-1);
  } else if (s[0] === '(') {
    let cnt = 1;
    let i;
    for (i = 1; i < s.length; i += 1) {
      if (s[i] === '(')
        cnt += 1;
      else if (s[i] === ')')
        cnt -= 1;

      if (!cnt) {
        if (s[i + 1] === '*') {
          const ss = s.slice(i + 2).match(/^\d+/);
          if (!ss)
            throw new Error('invalid pattern');
          return trans(s.slice(1, i)).repeat(parseInt(ss[0])) + trans(s.slice(i + 2 + s[0].length));
        } else {
          throw new Error('invalid pattern');
        }
      }
    }
    throw new Error('invalid pattern');
  } else {
    throw new Error('invalid pattern');
  }
}

const run = (s, i) => {
  i = i ?? 0;
  if (!s.length) {
    alert('Please fill in the input field.');
    isRunning.value = false;
    return;
  } else if (!s[i]) {
    if (confirm('Game over. Try again?')) {
      restart();
    } else {
      isComplete = true;
    }
    isRunning.value = false;
    return;
  } else if (isComplete) {
    return;
  }

  if (s[i] === 'F')
    go();
  else if (s[i] === 'L')
    turnLeft();
  else
    turnRight();

  if (!isComplete)
    setTimeout(() => run(s, i + 1), gapTime);
}

const clickPlayButton = () => {
  isRunning.value = true;
  try {
    const s = trans(inputValue.value.toUpperCase());
    setTimeout(() => run(s), gapTime);
  } catch (e) {
    alert('invalid answer.');
    isRunning.value = false;
  }
}

const direction2Angle = direction => {
  switch (direction) {
    case Game.Direction.TOP:    return 0;
    case Game.Direction.RIGHT:  return 90;
    case Game.Direction.DOWN:   return 180;
    case Game.Direction.LEFT:   return 270;
    default:                    return 0;
  }
}

onMounted(async () => {
  gObj = await fatchGame(new URLSearchParams(window.location.search).get('u'));
  game = new Game(gObj);
  update();
  slimeFace.value = (direction2Angle(game.getSlime().direction));
  unitLen.value = setUnitLen(game.getRows(), game.getCols());
  height.value = game.getRows() * unitLen.value;
  width.value = game.getCols() * unitLen.value;
});
</script>

<template>
<div class="play-wrap no-gap">
  <div class="map-wrap no-gap">
    <div class="map no-gap" :style="{ height: height + 'px', width: width + 'px' }">
      <div class="map-row no-gap"
        :style="{ height: unitLen + 'px', width: width + 'px' }"
        v-for="(r, i) in map" :key="i"
      >
        <div :class="'unit no-gap ' + unit2Class(map[i][j])"
          :style="{ height: unitLen - 1 + 'px', width: unitLen - 1 + 'px' }"
          v-for="(e, j) in r" :key="j"
        >
          <div class="gold-coin animated"
            :class="{ nocolor: unit2Class(map[i][j]) !== 'coin' }"
            :style="{ height: unitLen / 2 + 'px', width: unitLen / 2 + 'px' }"
          >$</div>
        </div>
      </div>
      <div class="animated slime"
        :style="{
          height: unitLen * 0.8 + 'px',
          width: unitLen * 0.8 + 'px',
          top: unitLen * slime.row + unitLen * 0.1 + 'px',
          left: unitLen * slime.col + unitLen * 0.1 + 'px',
          transform: 'rotate(' + slimeFace + 'deg)'
        }"
      >↑</div>
    </div>
  </div>
  <div class="ctrl-wrap no-gap">
    <div class="play-btn-wrap">
      <button :disabled="isRunning" class="play-btn" @click="clickPlayButton">
        ▶
      </button>
    </div>
    <div class="ans-wrap">
      <div class="ans-input-wrap">
        <input type="text"
          id="text-input"
          autocomplete="off"
          v-model="inputValue"
          @input="inputChanged"
          placeholder="(FLR)*100"
        />
      </div>
      <div class="ans-info-wrap">
        <div class="info-p-wrap">
          <p class="info-p">F: Forward（前進）</p>
          <p class="info-p">L: turn Left（左轉）</p>
          <p class="info-p">R: turn Right（右轉）</p>
        </div>
        <div class="info-p-wrap">
          <p class="info-p">(...)*n: repeat ... n times（重複括號內指令n次）</p>
        </div>
      </div>
    </div>
    <div class="opts-wrap">
      <div class="opts-btn-wrap">
        <button :disabled="isRunning" class="replay-btn opts-btn" @click="restart">restart</button>
      </div>
      <div class="opts-btn-wrap">
        <button class="back-btn opts-btn" @click="goBack">back</button>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.empty {
  background: #87ceeb;
}
.space {
  background: #5cb15f;
}
.coin {
  background: #5cb15f;
}
.gold-coin {
  background: #ffd700;
  border-radius: 50%;
  font-size: 48px;
}
.nocolor {
  opacity: 0;
}
.unit {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.slime {
  position: absolute;
  background-color: rgba(255, 0, 0, 0.5);
  pointer-events: none;
  border-radius: 50% 50% 50% 50%;
  font-size: 36px;
}
.animated {
  transition: left 1s ease, top 1s ease, transform 1s ease, opacity 1s cubic-bezier(0.95, 0, 0.05, 1);
}
.map {
  position: relative;
  background: #87ceeb;
}
.map-row {
  display: flex;
  justify-content: space-between;
}
.no-gap {
  margin: 0;
  border: 0;
  padding: 0;
}
.play-wrap {
  height: 100%;
  width: 100%;
}
.map-wrap {
  height: 80%;
  background-color: #87ceeb;
  display: flex;
  justify-content: center;
  align-items: center;
}
.ctrl-wrap {
  height: 20%;
  background-color: #e0e0e0;
  display: flex;
}
.play-btn-wrap {
  height: 100%;
  width: 15%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.play-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  font-size: 48px;
  border: none;
  cursor: pointer;
}
.play-btn:hover {
  opacity: 0.8;
}
.ans-wrap {
  height: 100%;
  width: 60%;
}
.ans-input-wrap {
  height: 40%;
  display: flex;
  justify-content: center;
}
input[type="text"] {
  margin-top: 6px;
  height: 40%;
  width: 90%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 24px;
}
input[type="text"]:focus {
  border-color: #007bff;
  outline: none;
}
.ans-info-wrap {
  height: 55%;
  background-color: #c0c0c0;
  border-radius: 4px;
  display: flex;
  margin-bottom: 5%;
}
.opts-wrap {
  position: relative;
  height: 100%;
  width: 25%;
}
.opts-btn-wrap {
  margin: 8% 0 8% 0;
  display: flex;
  justify-content: center;
}
.opts-btn {
  width: 60%;
  background-color: #2f2f2f;
}
.opts-btn:hover {
  opacity: 0.8;
}
.info-p-wrap {
  padding-left: 10px;
  text-align: left;
}
.info-p {
  margin: 0;
  color: #444444;
}
</style>
