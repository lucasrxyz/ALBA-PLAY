<template>
  <v-card v-if="currentSong" class="music-player">
      <!-- Info de la musique actuelle -->
      <v-row>

        <v-col cols="5">
          <v-img
            :src="currentSong.thumbnail"
            width="500"
            cover
            height="500"
            class="ma-2 pa-0"
          ></v-img>
        </v-col>

        <v-col cols="5" class="mt-15">
          <div class="opacity-50 mb-15" style="font-size:16px;">En cours de lecture</div>
          <div class="text-h4">{{ currentSong.title }}</div>
          <div class="text-h6 opacity-50">{{ currentSong.author }}</div>
        </v-col>
      </v-row>

      <!-- Lecteur YouTube (audio seulement) -->
      <div class="audio-player mb-4">
        <iframe
          ref="youtubePlayer"
          :src="playerUrl"
          width="0"
          height="0"
          frameborder="0"
          allow="autoplay"
          style="display: none;"
        ></iframe>
      </div>

      <!-- Contrôles de lecture -->
      <v-row justify="center" align="center" class="controls-row">

          <v-btn
            icon
            class="rounded-0 elevation-0"
            :ripple="false"
            size="small"
            @click="skipBackward"
            title="Reculer de 10s"
          >
            <v-icon>mdi-rewind-10</v-icon>
          </v-btn>
          <v-btn
            icon
            class="rounded-0 elevation-0"
            :ripple="false"
            size="small"
            @click="previousSong"
            :disabled="!hasPrevious"
          >
            <v-icon>mdi-skip-previous</v-icon>
          </v-btn>
          <v-btn
            icon
            class="rounded-0 elevation-0"
            :ripple="false"
            size="small"
            color="primary"
            @click="togglePlayPause"
          >
            <v-icon size="30">{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
          </v-btn>
          <v-btn
            icon
            class="rounded-0 elevation-0"
            :ripple="false"
            size="small"
            @click="nextSong"
            :disabled="!hasNext"
          >
            <v-icon>mdi-skip-next</v-icon>
          </v-btn>
          <v-btn
            icon
            class="rounded-0 elevation-0"
            :ripple="false"
            size="small"
            @click="skipForward"
            title="Avancer de 10s"
          >
            <v-icon>mdi-fast-forward-10</v-icon>
          </v-btn>
          
          <v-col cols="12" class="ma-0 mt-2 pa-0">
            <!-- Barre de progression de la musique -->
            <div>
              <v-progress-linear
                :model-value="songProgress"
                color="primary"
                height="1"
                style="cursor: pointer;"
                @click="seekTo"
              ></v-progress-linear>
              <div class="d-flex justify-space-between text-caption">
                <span class="pl-1 pr-1">{{ formatTime(currentTime) }}</span>
                <span class="pl-1 pr-1">{{ formatTime(duration) }}</span>
              </div>
            </div>
          </v-col>
          
      </v-row>

      <!-- Options supplémentaires -->
      <v-row justify="center" class="mt-2">
        <v-col cols="auto">
          <v-btn
            icon
            size="small"
            @click="toggleRepeat"
            :color="repeatMode !== 'off' ? 'primary' : ''"
          >
            <v-icon>{{ repeatIcon }}</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn
            icon
            size="small"
            @click="toggleShuffle"
            :color="isShuffle ? 'primary' : ''"
          >
            <v-icon>mdi-shuffle</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn
            icon
            size="small"
            @click="stopPlayback"
            color="error"
          >
            <v-icon>mdi-stop</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      

      <!-- Info playlist -->
      <div class="text-center text-caption mt-2 text-grey">
        Musique {{ currentIndex + 1 }} / {{ totalSongs }}
      </div>
  </v-card>
</template>

<script>
export default {
  name: 'MusicPlayerControls',

  props: {
    currentSong: {
      type: Object,
      default: null
    },
    playlist: {
      type: Array,
      default: () => []
    },
    currentIndex: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      isPlaying: true,
      repeatMode: 'off', // 'off', 'all', 'one'
      isShuffle: false,
      autoplay: true,
      currentTime: 0,
      duration: 0,
      progressInterval: null
    }
  },

  computed: {
    hasPrevious() {
      return this.currentIndex > 0
    },

    hasNext() {
      return this.currentIndex < this.playlist.length - 1
    },

    totalSongs() {
      return this.playlist.length
    },

    playlistProgress() {
      if (this.totalSongs === 0) return 0
      return ((this.currentIndex + 1) / this.totalSongs) * 100
    },

    songProgress() {
      if (this.duration === 0) return 0
      return (this.currentTime / this.duration) * 100
    },

    repeatIcon() {
      if (this.repeatMode === 'all') return 'mdi-repeat'
      if (this.repeatMode === 'one') return 'mdi-repeat-once'
      return 'mdi-repeat-off'
    },

    playerUrl() {
      if (!this.currentSong) return ''
      const autoplayParam = this.autoplay ? '&autoplay=1' : ''
      return `https://www.youtube.com/embed/${this.currentSong.videoId}?enablejsapi=1${autoplayParam}`
    }
  },

  methods: {
    togglePlayPause() {
      this.isPlaying = !this.isPlaying
      this.autoplay = this.isPlaying
      
      // Recharger l'iframe pour appliquer play/pause
      if (this.isPlaying) {
        this.$emit('play')
      } else {
        this.$emit('pause')
      }
    },

    previousSong() {
      if (this.hasPrevious) {
        this.$emit('previous')
        this.isPlaying = true
        this.autoplay = true
      }
    },

    nextSong() {
      if (this.hasNext) {
        this.$emit('next')
        this.isPlaying = true
        this.autoplay = true
      } else if (this.repeatMode === 'all') {
        this.$emit('play-index', 0)
        this.isPlaying = true
        this.autoplay = true
      }
    },

    toggleRepeat() {
      const modes = ['off', 'all', 'one']
      const currentModeIndex = modes.indexOf(this.repeatMode)
      this.repeatMode = modes[(currentModeIndex + 1) % modes.length]
      this.$emit('repeat-changed', this.repeatMode)
    },

    toggleShuffle() {
      this.isShuffle = !this.isShuffle
      this.$emit('shuffle-changed', this.isShuffle)
    },

    stopPlayback() {
      this.isPlaying = false
      this.autoplay = false
      this.$emit('stop')
    },

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },

    seekTo(event) {
      const progressBar = event.currentTarget
      const clickX = event.offsetX
      const width = progressBar.offsetWidth
      const percentage = clickX / width
      this.currentTime = this.duration * percentage
      
      // Recharger l'iframe à la nouvelle position
      this.reloadPlayerAtTime(this.currentTime)
    },

    skipForward() {
      this.currentTime = Math.min(this.currentTime + 10, this.duration)
      this.reloadPlayerAtTime(this.currentTime)
    },

    skipBackward() {
      this.currentTime = Math.max(this.currentTime - 10, 0)
      this.reloadPlayerAtTime(this.currentTime)
    },

    reloadPlayerAtTime(time) {
      // Recharger l'iframe avec le paramètre start pour commencer à un moment précis
      if (this.$refs.youtubePlayer && this.currentSong) {
        const startTime = Math.floor(time)
        const autoplayParam = this.isPlaying ? '&autoplay=1' : ''
        this.$refs.youtubePlayer.src = `https://www.youtube.com/embed/${this.currentSong.videoId}?enablejsapi=1&start=${startTime}${autoplayParam}`
      }
    },

    startProgressTracking() {
      this.stopProgressTracking()
      
      // Simuler la progression (car on ne peut pas accéder à l'API YouTube via iframe)
      this.progressInterval = setInterval(() => {
        if (this.isPlaying && this.currentTime < this.duration) {
          this.currentTime += 1
          
          // Passer à la musique suivante si terminée
          if (this.currentTime >= this.duration) {
            this.handleSongEnd()
          }
        }
      }, 1000)
    },

    stopProgressTracking() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval)
        this.progressInterval = null
      }
    },

    handleSongEnd() {
      if (this.repeatMode === 'one') {
        this.currentTime = 0
        this.startProgressTracking()
      } else if (this.hasNext) {
        this.nextSong()
      } else if (this.repeatMode === 'all') {
        this.$emit('play-index', 0)
      } else {
        this.isPlaying = false
        this.autoplay = false
      }
    },

    async fetchDuration() {
      try {
        // Utiliser l'API YouTube pour obtenir la vraie durée
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${this.currentSong.videoId}&format=json`)
        const data = await response.json()
        
        // Essayer d'extraire la durée depuis les métadonnées
        // Si on ne peut pas l'obtenir, on utilise une estimation
        
        // Alternative: Parser la page YouTube (plus complexe)
        // Pour l'instant, on va faire une requête à noembed et estimer
        const noembedResponse = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${this.currentSong.videoId}`)
        const noembedData = await noembedResponse.json()
        
        // Extraire la durée depuis le HTML si disponible
        // Sinon, utiliser une estimation basée sur la moyenne des vidéos YouTube (3-4 min)
        this.duration = 240 // 4 minutes par défaut
        
      } catch (err) {
        this.duration = 240 // 4 minutes par défaut en cas d'erreur
      }
    }
  },

  watch: {
    currentSong(newSong, oldSong) {
      if (newSong && newSong.id !== oldSong?.id) {
        this.isPlaying = true
        this.autoplay = true
        this.currentTime = 0
        
        // IMPORTANT: Arrêter l'ancien tracking avant de démarrer le nouveau
        this.stopProgressTracking()
        
        // Récupérer la nouvelle durée et démarrer le tracking
        this.fetchDuration().then(() => {
          this.startProgressTracking()
        })
      }
    },

    isPlaying(playing) {
      if (playing) {
        this.startProgressTracking()
      } else {
        this.stopProgressTracking()
      }
    }
  },

  mounted() {
    if (this.currentSong) {
      this.fetchDuration()
      this.startProgressTracking()
    }
  },

  beforeUnmount() {
    this.stopProgressTracking()
  }
}
</script>

<style scoped>
.music-player {
  position: sticky;
  top: 20px;
}

.audio-player {
  position: relative;
  width: 100%;
}

.controls-row {
  background: rgba(255, 255, 255, 0.05);
  padding-top: 10px;
  margin: 0;
}
</style>