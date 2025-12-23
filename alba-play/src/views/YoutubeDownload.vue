<template>
  <v-container>
    <v-btn to="/">Retour</v-btn>
    <v-card>
      <v-card-title class="text-h5">
        <v-icon left>mdi-youtube</v-icon>
        YouTube Downloader
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="youtubeUrl"
          label="Coller le lien YouTube"
          prepend-icon="mdi-link"
          variant="outlined"
          placeholder="https://www.youtube.com/watch?v=..."
          @keyup.enter="fetchVideoInfo"
          clearable
        ></v-text-field>

        <v-btn
          color="primary"
          block
          @click="fetchVideoInfo"
          :disabled="!youtubeUrl || isLoading"
          :loading="isLoading"
        >
          Obtenir les infos
        </v-btn>

        <v-alert
          v-if="error"
          type="error"
          class="mt-4"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <v-card v-if="videoInfo" class="mt-4" variant="outlined">
          <v-row no-gutters>
            <v-col cols="12" md="4">
              <v-img
                :src="videoInfo.thumbnail_url"
                height="200"
                cover
              ></v-img>
            </v-col>
            <v-col cols="12" md="8">
              <v-card-text>
                <div class="text-h6 mb-2">{{ videoInfo.title }}</div>
                <div class="text-subtitle-2 mb-2">{{ videoInfo.author_name }}</div>
                
                <v-divider class="my-3"></v-divider>

                <v-select
                  v-model="selectedQuality"
                  :items="qualities"
                  label="Qualité"
                  variant="outlined"
                  density="compact"
                ></v-select>

                <v-btn
                  color="success"
                  block
                  @click="downloadVideo"
                  prepend-icon="mdi-download"
                >
                  Télécharger
                </v-btn>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>

        <v-card v-if="embedPreview" class="mt-4">
          <v-card-title>Aperçu</v-card-title>
          <v-card-text>
            <iframe
              :src="embedPreview"
              width="100%"
              height="400"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script>
import router from '../router';

export default {
  name: 'YouTubeDownloader',

  data() {
    return {
      youtubeUrl: '',
      videoInfo: null,
      isLoading: false,
      error: null,
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
      selectedQuality: '720p',
      qualities: ['360p', '480p', '720p', '1080p'],
      embedPreview: null
    }
  },

  computed: {
    videoId() {
      if (!this.youtubeUrl) return null
      try {
        const url = new URL(this.youtubeUrl)
        return url.searchParams.get('v') || url.pathname.split('/').pop()
      } catch {
        return null
      }
    },

    embedUrl() {
      if (!this.videoId) return null
      return `https://www.youtube.com/embed/${this.videoId}`
    }
  },

  methods: {
    async fetchVideoInfo() {
      if (!this.youtubeUrl) return

      this.isLoading = true
      this.error = null
      this.videoInfo = null
      this.embedPreview = null

      try {
        const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(this.youtubeUrl)}`)
        
        if (!response.ok) {
          throw new Error('URL YouTube invalide')
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        this.videoInfo = data
        this.embedPreview = this.embedUrl
        this.showSnackbar('Informations récupérées!', 'success')

      } catch (err) {
        this.error = err.message || 'Erreur lors de la récupération des informations'
        this.showSnackbar(this.error, 'error')
      } finally {
        this.isLoading = false
      }
    },

    downloadVideo() {
      if (!this.videoId) return

      // Méthode 1: Utiliser des services tiers
      const downloadServices = [
        `https://www.y2mate.com/youtube/${this.videoId}`,
        `https://ytmp3.cc/en13/${this.videoId}`,
        `https://www.savefrom.net/${this.youtubeUrl}`
      ]

      // Ouvrir le premier service dans un nouvel onglet
      window.open(downloadServices[0], '_blank')
      
      this.showSnackbar('Ouverture du service de téléchargement...', 'info')
      
      // Alternative: Créer un lien de téléchargement direct (ne fonctionne pas toujours)
      // const downloadUrl = `https://www.youtube.com/watch?v=${this.videoId}`
      // const link = document.createElement('a')
      // link.href = downloadUrl
      // link.download = `${this.videoInfo.title}.mp4`
      // link.click()
    },

    showSnackbar(message, color = 'success') {
      this.snackbarMessage = message
      this.snackbarColor = color
      this.snackbar = true
    }
  },

  mounted() {
    console.log('YouTube Downloader prêt')
  }
}
</script>

<style scoped>
iframe {
  border-radius: 8px;
}
</style>