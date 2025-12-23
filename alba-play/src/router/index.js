import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import YouTubeDownloader from '../views/YoutubeDownload.vue'
import PlaylistHelper from '../views/PlaylistHelper.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/youtube', component: YouTubeDownloader },
  { path: '/playlistHelper', component: PlaylistHelper }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router