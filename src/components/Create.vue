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
    }
  }
  while (currWidth != w) {
    if (currWidth < w) {
      map.forEach(row => row.push(Game.Unit.EMPTY));
      currWidth += 1;
    } else {
      map.forEach(row => row.pop());
      currWidth -= 1;
    }
  }
}

const sizeChanged = (h, w) => {
  unitLen.value = setUnitLen(h, w);
  height.value = h * unitLen.value;
  width.value = w * unitLen.value;
  resizeMap(h, w);
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
          v-for="(e, j) in r" :key="j"
        ></div>
      </div>
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
