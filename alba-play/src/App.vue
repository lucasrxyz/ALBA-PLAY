<template>
  <v-app>
    <v-main>
      <v-container class="text-center">
        <v-btn
          class="text-none"
          color="primary"
          @click="toggleTheme">
          Switch to {{ isDark ? 'Light' : 'Dark' }} mode
        </v-btn>
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
