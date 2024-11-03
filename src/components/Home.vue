<script setup>
import { ref, onMounted } from 'vue';

const name = ref("List");
const page = ref(0);
const items = ref([]);

const count = 3;

const navigateByUuid = uuid => {
  window.location.href = `${window.location.origin}/play?u=${uuid}`;
}

const clickNextPage = async () => {
  const games = await fatchGameList(page.value + 1, count);
  if (games.length) {
    page.value += 1;
    items.value = games;
  } else {
    alert("You've reached the last page.");
  }
}

const clickPrevPage = async () => {
  if (page.value) {
    items.value = await fatchGameList(page.value -= 1, count);
  } else {
    alert("You've reached the first page.");
  }
}

const fatchGameList = async (p, c) => {
  try {
    const response = await fetch(`${window.location.origin}/api/game/list?p=${p}&c=${c}`);
    const value = await response.json();
    return value.isSuccess ? value.games : [];
  } catch (e) {
    console.error(e);
  }
};

onMounted(async () => {
  items.value = await fatchGameList(page.value, count);
});
</script>

<template>
  <div class="list-wrap">
    <ul>
      <li
        class="clickable"
        v-for="(item, index) in items"
        :key="index"
        @click="navigateByUuid(item.uuid)"
      >
        <div class="li-id li-txt-wrap">
          {{ item.id }}
        </div>
        <div class="li-title li-txt-wrap">
          {{ item.title }}
        </div>
        <div class="li-author li-txt-wrap">
          {{ item.author }}
        </div>
      </li>
    </ul>
    <div class="page-ctrl">
      <div class="prev-btn page-btn clickable" @click="clickPrevPage">&lt;</div>
      <div class="page">{{ page + 1 }}</div>
      <div class="next-btn page-btn clickable" @click="clickNextPage">&gt;</div>
    </div>
  </div>
</template>

<style scoped>
.clickable {
  cursor: pointer;
}
div.list-wrap {
  width: 100%;
  height: 100%;
  justify-content: center;
}
ul {
  list-style-type: none;
  padding: 0 8px;
}
li {
  padding: 8px 8px 8px 16px;
  margin: 4px 0;
  background-color: #cfcfcf;
  border: 1px solid;
  border-color: #7f7f7f;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
}
li:hover {
  border-color: #afafaf;
  background-color: #efefef;
}
div.li-txt-wrap {
  color: #4f4f4f;
}
.page-ctrl {
  display: flex;
  justify-content: center;
  color: #000000;
}
.page-btn {
  margin: 0 16px;
  font-size: 18px;
  background-color: #aaaaaa;
  border-radius: 4px;
  border: #000000 1px solid;
}
.page-btn:hover {
  background-color: #eeeeee;
}
</style>
