<script setup>
import { ref, reactive, onMounted } from 'vue';
import Game from '@/models/Game.js';

const mapHeight = 540;
const mapWidth = 930;

const heigthInput = ref(5);
const widthInput = ref(5);
const height = ref(30);
const width = ref(30);
const unitLen = ref(30);
const map = reactive([]);
const currUnit = ref(1);
const slimeExist = ref(false);
const slimeFace = ref(0);
const slimeRow = ref(0);
const slimeCol = ref(0);

const chooseUnit = unit => {
  currUnit.value = unit;
}

const clickUnit = (x, y) => {
  if (currUnit.value <= 2) {
    map[x][y] = currUnit.value;
    if (slimeExist.value && x === slimeRow.value && y === slimeCol.value) {
      slimeExist.value = false;
    }
  } else {
    map[x][y] = 1;
    slimeExist.value = true;
    slimeRow.value = x;
    slimeCol.value = y;
    slimeFace.value = (currUnit.value - 3) * 90;
  }
}

const setUnitLen = (row, col) => {
  const unitHeight = parseInt(mapHeight / row);
  const unitWidth = parseInt(mapWidth / col);
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

const resizeMap = (h, w) => {
  let currHeight = map.length;
  let currWidth = currHeight ? map[0].length : 0;
  while (currHeight != h) {
    if (currHeight < h) {
      map.push(Array(currWidth).fill(Game.Unit.EMPTY));
      currHeight += 1;
    } else {
      map.pop();
      currHeight -= 1;
      if (currHeight <= slimeRow.value && slimeExist.value) {
        slimeExist.value = false;
      }
    }
  }
  while (currWidth != w) {
    if (currWidth < w) {
      map.forEach(row => row.push(Game.Unit.EMPTY));
      currWidth += 1;
    } else {
      map.forEach(row => row.pop());
      currWidth -= 1;
      if (currWidth <= slimeCol.value && slimeExist.value) {
        slimeExist.value = false;
      }
    }
  }
}

const sizeChanged = (h, w) => {
  unitLen.value = setUnitLen(h, w);
  height.value = h * unitLen.value;
  width.value = w * unitLen.value;
  resizeMap(h, w);
}

const coinCanEat = (r, c, m) => {
  if (!m[r][c]) {
    return 0;
  } else {
    let cnt = m[r][c] === 2 ? 1 : 0
    m[r][c] = 0;
    return cnt
      + (r + 1 === heigthInput.value ? 0 : coinCanEat(r + 1, c, m))
      + (r ? coinCanEat(r - 1, c, m) : 0)
      + (c + 1 === widthInput.value ? 0 : coinCanEat(r, c + 1, m))
      + (c ? coinCanEat(r, c - 1, m) : 0)
  }
}

const isValidMap = () => {
  let cnt = 0;
  map.forEach(r => r.forEach(e => cnt += e === 2 ? 1 : 0));
  let copyMap = Array.from({ length: heigthInput.value }, () => Array(widthInput.value).fill(0));
  for (let i = 0; i < heigthInput.value; i += 1) {
    for (let j = 0; j < widthInput.value; j += 1)
      copyMap[i][j] = map[i][j];
  }
  return cnt === coinCanEat(slimeRow.value, slimeCol.value, copyMap);
}

const assertGameValid = () => {
  if (!slimeExist.value) {
    throw new Error('Slime is not yet configured');
  } else if (map[slimeRow.value][slimeCol.value] !== 1) {
    throw new Error('Slime is located in an invalid unit.');
  } else if (!map.some(r => r.includes(2))) {
    throw new Error('Coins are not configured.');
  } else if (!isValidMap()) {
    throw new Error('Unpassable map.');
  }
}

const clickCommit = async () => {
  try {
    let title;
    let author;
    assertGameValid();
    if (!(title = prompt("Please enter a title.")))
      return;
    if (!(author = prompt("Please enter an author.")))
      return;

    const response = await fetch(`${window.location.origin}/api/game/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        author: author,
        row_cnt: heigthInput.value,
        col_cnt: widthInput.value,
        map: map.map(r => r.join('')).join(''),
        slime_row: slimeRow.value,
        slime_col: slimeCol.value,
        slime_direction: parseInt(slimeFace.value / 90) % 4
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const responseData = await response.json();
    if (responseData.isSuccess) {
      throw new Error('Commit successful.');
    } else if (responseData.isRepeatTitle) {
      throw new Error('Title repeated.');
    } else if (responseData.invalidMap) {
      throw new Error('The map is invalid.');
    } else {
      throw new Error(responseData.message);
    }
  } catch (e) {
    alert(e.message);
  }
}

const goBack = () => {
  window.history.back();
}

onMounted(async () => {
  sizeChanged(heigthInput.value, widthInput.value);
  resizeMap(heigthInput.value, widthInput.value);
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
        <div :class="'unit one-gap ' + unit2Class(map[i][j])"
          :style="{ height: unitLen - 2 + 'px', width: unitLen - 2 + 'px' }"
          @click="clickUnit(i, j)"
          v-for="(e, j) in r" :key="j"
        >
          <div class="big-gold-coin"
            :class="{ nocolor: unit2Class(map[i][j]) !== 'coin' }"
            :style="{
              'font-size': unitLen / 3.5 + 'px',
              height: unitLen / 2 + 'px',
              width: unitLen / 2 + 'px'
            }"
          >$</div>
        </div>
      </div>
      <div class="big-slime"
        :class="{ nocolor: !slimeExist }"
        :style="{
          'font-size': unitLen / 3 + 'px',
          height: unitLen * 0.8 + 'px',
          width: unitLen * 0.8 + 'px',
          top: unitLen * slimeRow + unitLen * 0.1 + 'px',
          left: unitLen * slimeCol + unitLen * 0.1 + 'px',
          transform: 'rotate(' + slimeFace + 'deg)'
        }"
      >↑</div>
    </div>
  </div>
  <div class="ctrl-wrap no-gap">
    <div class="size-input-wrap">
      <div class="heigth-input-wrap input-wrap">
        <label for="heigth-input">Height:</label>
        <input id="heigth-input"
          v-model="heigthInput"
          @input="sizeChanged(heigthInput, widthInput)"
          type="number"
          value="5"
          min="1"
          max="15"
        >
      </div>
      <div class="width-input-wrap input-wrap">
        <label for="width-input">Width:</label>
        <input id="width-input"
          v-model="widthInput"
          @input="sizeChanged(heigthInput, widthInput)"
          type="number"
          value="5"
          min="1"
          max="15"
        >
      </div>
    </div>
    <div class="unit-opts-wrap">
      <div class="unit-opt-wrap empty"
        :class="{ hasborder: currUnit === 0 }"
        @click="chooseUnit(0)"
      >Empty</div>
      <div class="unit-opt-wrap space"
        :class="{ hasborder: currUnit === 1 }"
        @click="chooseUnit(1)"
      >Space</div>
      <div class="unit-opt-wrap coin"
        :class="{ hasborder: currUnit === 2 }"
        @click="chooseUnit(2)"
      ><div class="gold-coin">$</div></div>
      <div class="unit-opt-wrap space"
        :class="{ hasborder: currUnit === 3 }"
        @click="chooseUnit(3)"
      ><div class="slime">Slime Face Top</div></div>
      <div class="unit-opt-wrap space"
        :class="{ hasborder: currUnit === 4 }"
        @click="chooseUnit(4)"
      ><div class="slime">Slime Face Right</div></div>
      <div class="unit-opt-wrap space"
        :class="{ hasborder: currUnit === 5 }"
        @click="chooseUnit(5)"
      ><div class="slime">Slime Face Down</div></div>
      <div class="unit-opt-wrap space"
        :class="{ hasborder: currUnit === 6 }"
        @click="chooseUnit(6)"
      ><div class="slime">Slime Face Left</div></div>
    </div>
    <div class="final-opts-wrap">
      <div class="opts-btn-wrap">
        <button class="opts-btn" @click="clickCommit">Commit</button>
      </div>
      <div class="opts-btn-wrap">
        <button class="opts-btn" @click="goBack">back</button>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.opts-btn:hover {
  opacity: 0.5;
}
.opts-btn-wrap {
  margin: 8% 0 8% 0;
  display: flex;
  justify-content: center;
}
.final-opts-wrap {
  width: 15%;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.big-slime {
  position: absolute;
  background-color: rgba(255, 0, 0, 0.5);
  pointer-events: none;
  border-radius: 50% 50% 50% 50%;
}
.hasborder {
  border: solid 2px blue;
}
.unit-opt-wrap {
  background-color: #afafaf;
  height: 60%;
  width: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  cursor: pointer;
}
.unit-opts-wrap {
  position: relative;
  height: 100%;
  width: 70%;
  background-color: #cfcfcf;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.slime {
  background-color: rgba(255, 0, 0, 0.5);
  border-radius: 50% 50% 50% 50%;
  font-size: 10px;
  width: 50px;
  height: 50px;
}
.empty {
  background: #77bedb;
}
.space {
  background: #5cb15f;
}
.coin {
  background: #5cb15f;
}
.nocolor {
  opacity: 0;
}
.big-gold-coin {
  background: #ffd700;
  border-radius: 50%;
}
.gold-coin {
  background: #ffd700;
  border-radius: 50%;
  font-size: 20px;
  height: 30px;
  width: 30px;
}
.no-gap {
  margin: 0;
  border: 0;
  padding: 0;
}
.one-gap {
  margin: 0;
  border: 1px solid #afafaf;
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
.map {
  position: relative;
  background: #77bedb;
}

.ctrl-wrap {
  height: 20%;
  background-color: #e0e0e0;
  display: flex;
}
.size-input-wrap {
  height: 100%;
  width: 15%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
label {
  color: #2f2f2f;
}
.input-wrap {
  margin: 10px 0;
}
.map-row {
  display: flex;
  justify-content: space-between;
}
.unit {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.unit:hover {
  opacity: 0.5;
}
</style>
