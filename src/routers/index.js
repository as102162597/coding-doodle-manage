import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/components/Home.vue';
import Play from '@/components/Play.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/play', component: Play },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
