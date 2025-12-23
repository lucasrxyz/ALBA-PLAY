<template>
  <v-app>
    <v-app-bar 
      density="compact" 
      color="primary" 
      height="50" 
      style="-webkit-app-region: drag">
      <v-app-bar-title><v-icon>mdi-eye</v-icon>alba-play</v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <v-btn 
        @click="toggleTheme"
        size="small"
        style="-webkit-app-region: no-drag">
        <v-icon>{{ isDark ? 'mdi-eye' : 'mdi-eye' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}
</script>