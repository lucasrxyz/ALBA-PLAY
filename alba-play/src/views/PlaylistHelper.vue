<template>
  <v-container>
    <v-row>
      <!-- Sidebar des playlists -->
      <v-col cols="12" md="3">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-folder-music</v-icon>
            Playlists
          </v-card-title>
          
          <v-card-text>
            <v-text-field
              v-model="newPlaylistName"
              label="Nouvelle playlist"
              density="compact"
              variant="outlined"
              @keyup.enter="createPlaylist"
            ></v-text-field>
            
            <v-btn
              color="primary"
              block
              size="small"
              @click="createPlaylist"
              prepend-icon="mdi-plus"
            >
              Créer
            </v-btn>

            <v-divider class="my-3"></v-divider>

            <v-list density="compact">
              <v-list-item
                v-for="playlist in playlists"
                :key="playlist.id"
                :active="selectedPlaylist?.id === playlist.id"
                @click="selectPlaylist(playlist)"
              >
                <template v-slot:prepend>
                  <v-avatar size="40" class="mr-2">
                    <v-img
                      v-if="playlist.coverImage"
                      :src="playlist.coverImage"
                      cover
                    ></v-img>
                    <v-icon v-else>mdi-playlist-music</v-icon>
                  </v-avatar>
                </template>
                
                <v-list-item-title>{{ playlist.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ playlist.songs.length }} sons</v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click.stop="openImageDialog(playlist)"
                    class="mr-1"
                  >
                    <v-icon>mdi-image-edit</v-icon>
                  </v-btn>
                  
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click.stop="deletePlaylist(playlist.id)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Zone principale -->
      <v-col cols="12" md="9">
        <!-- Ajouter une musique -->
        <v-card class="mb-4">
          <v-card-title>
            <v-icon left>mdi-youtube</v-icon>
            Ajouter une musique
          </v-card-title>
          
          <v-card-text>
            <v-text-field
              v-model="youtubeUrl"
              label="Lien YouTube"
              prepend-icon="mdi-link"
              variant="outlined"
              placeholder="https://www.youtube.com/watch?v=..."
              :disabled="!selectedPlaylist"
            ></v-text-field>

            <v-btn
              color="success"
              block
              @click="addSongToPlaylist"
              :disabled="!youtubeUrl || !selectedPlaylist || isLoading"
              :loading="isLoading"
              prepend-icon="mdi-plus"
            >
              Ajouter à {{ selectedPlaylist?.name || 'une playlist' }}
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Liste des musiques de la playlist -->
        <v-card v-if="selectedPlaylist">
          <v-card-title>
            <v-icon left>mdi-music-note</v-icon>
            {{ selectedPlaylist.name }}
          </v-card-title>

          <v-card-text>
            <v-alert v-if="selectedPlaylist.songs.length === 0" type="info">
              Aucune musique dans cette playlist
            </v-alert>

            <v-list v-else>
              <v-list-item
                v-for="(song, index) in selectedPlaylist.songs"
                :key="song.id"
                class="mb-2"
              >
                <template v-slot:prepend>
                  <v-img
                    :src="song.thumbnail"
                    width="80"
                    height="60"
                    class="rounded"
                  ></v-img>
                </template>

                <v-list-item-title>{{ song.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ song.author }}</v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn
                    icon
                    size="small"
                    color="primary"
                    @click="playSong(song)"
                    class="mr-2"
                  >
                    <v-icon>mdi-play</v-icon>
                  </v-btn>
                  
                  <v-btn
                    icon
                    size="small"
                    color="error"
                    @click="removeSong(index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Lecteur avec contrôles -->
        <MusicPlayerControls
          v-if="currentSong"
          :current-song="currentSong"
          :playlist="selectedPlaylist?.songs || []"
          :current-index="currentSongIndex"
          @previous="playPrevious"
          @next="playNext"
          @play-index="playSongByIndex"
          @stop="stopPlayback"
          class="mt-4"
        />
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" :color="snackbarColor">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- Dialog pour changer l'image de la playlist -->
    <v-dialog v-model="imageDialog" max-width="500">
      <v-card>
        <v-card-title>Changer l'image de {{ editingPlaylist?.name }}</v-card-title>
        
        <v-card-text>
          <v-text-field
            v-model="newImageUrl"
            label="URL de l'image"
            prepend-icon="mdi-link"
            variant="outlined"
            placeholder="https://..."
            hint="Collez l'URL d'une image"
          ></v-text-field>

          <v-divider class="my-4"></v-divider>

          <div class="text-center">
            <v-file-input
              v-model="imageFile"
              label="Ou choisir un fichier"
              prepend-icon="mdi-image"
              accept="image/*"
              variant="outlined"
              @change="handleFileUpload"
            ></v-file-input>
          </div>

          <v-card v-if="newImageUrl || imagePreview" variant="outlined" class="mt-4">
            <v-img
              :src="imagePreview || newImageUrl"
              height="200"
              cover
            ></v-img>
          </v-card>
        </v-card-text>

        <v-card-actions>
          <v-btn @click="removePlaylistImage" color="error" variant="text">
            Supprimer l'image
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="imageDialog = false">Annuler</v-btn>
          <v-btn @click="savePlaylistImage" color="primary">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import MusicPlayerControls from '../components/MusicPlayerControls.vue'

export default {
  name: 'MusicPlaylistManager',

  components: {
    MusicPlayerControls
  },

  data() {
    return {
      playlists: [],
      selectedPlaylist: null,
      newPlaylistName: '',
      youtubeUrl: '',
      isLoading: false,
      currentSong: null,
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
      imageDialog: false,
      editingPlaylist: null,
      newImageUrl: '',
      imageFile: null,
      imagePreview: null
    }
  },

  computed: {
    playlistsJson() {
      return JSON.stringify(this.playlists)
    },

    currentSongIndex() {
      if (!this.currentSong || !this.selectedPlaylist) return -1
      return this.selectedPlaylist.songs.findIndex(s => s.id === this.currentSong.id)
    }
  },

  methods: {
    createPlaylist() {
      if (!this.newPlaylistName.trim()) return

      const newPlaylist = {
        id: Date.now().toString(),
        name: this.newPlaylistName,
        songs: [],
        coverImage: null
      }

      this.playlists.push(newPlaylist)
      this.newPlaylistName = ''
      this.saveToLocalStorage()
      this.showSnackbar('Playlist créée!', 'success')
    },

    selectPlaylist(playlist) {
      this.selectedPlaylist = playlist
    },

    deletePlaylist(playlistId) {
      const index = this.playlists.findIndex(p => p.id === playlistId)
      if (index !== -1) {
        this.playlists.splice(index, 1)
        if (this.selectedPlaylist?.id === playlistId) {
          this.selectedPlaylist = null
        }
        this.saveToLocalStorage()
        this.showSnackbar('Playlist supprimée', 'info')
      }
    },

    async addSongToPlaylist() {
      if (!this.youtubeUrl || !this.selectedPlaylist) return

      this.isLoading = true

      try {
        const videoId = this.extractVideoId(this.youtubeUrl)
        if (!videoId) {
          throw new Error('URL YouTube invalide')
        }

        // Récupérer les infos de la vidéo
        const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(this.youtubeUrl)}`)
        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        const song = {
          id: Date.now().toString(),
          videoId: videoId,
          url: this.youtubeUrl,
          title: data.title,
          author: data.author_name,
          thumbnail: data.thumbnail_url
        }

        this.selectedPlaylist.songs.push(song)
        this.youtubeUrl = ''
        this.saveToLocalStorage()
        this.showSnackbar('Musique ajoutée!', 'success')

      } catch (err) {
        this.showSnackbar(err.message || 'Erreur', 'error')
      } finally {
        this.isLoading = false
      }
    },

    removeSong(index) {
      if (this.selectedPlaylist) {
        this.selectedPlaylist.songs.splice(index, 1)
        this.saveToLocalStorage()
        this.showSnackbar('Musique supprimée', 'info')
      }
    },

    playSong(song) {
      this.currentSong = song
    },

    playPrevious() {
      if (this.currentSongIndex > 0 && this.selectedPlaylist) {
        this.currentSong = this.selectedPlaylist.songs[this.currentSongIndex - 1]
      }
    },

    playNext() {
      if (this.currentSongIndex < this.selectedPlaylist.songs.length - 1 && this.selectedPlaylist) {
        this.currentSong = this.selectedPlaylist.songs[this.currentSongIndex + 1]
      }
    },

    playSongByIndex(index) {
      if (this.selectedPlaylist && this.selectedPlaylist.songs[index]) {
        this.currentSong = this.selectedPlaylist.songs[index]
      }
    },

    stopPlayback() {
      this.currentSong = null
    },

    openImageDialog(playlist) {
      this.editingPlaylist = playlist
      this.newImageUrl = playlist.coverImage || ''
      this.imagePreview = null
      this.imageFile = null
      this.imageDialog = true
    },

    handleFileUpload(event) {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
          this.newImageUrl = ''
        }
        reader.readAsDataURL(file)
      }
    },

    savePlaylistImage() {
      if (this.editingPlaylist) {
        const imageUrl = this.imagePreview || this.newImageUrl
        const playlistIndex = this.playlists.findIndex(p => p.id === this.editingPlaylist.id)
        
        if (playlistIndex !== -1) {
          this.playlists[playlistIndex].coverImage = imageUrl
          this.saveToLocalStorage()
          this.showSnackbar('Image mise à jour!', 'success')
        }
      }
      this.imageDialog = false
    },

    removePlaylistImage() {
      if (this.editingPlaylist) {
        const playlistIndex = this.playlists.findIndex(p => p.id === this.editingPlaylist.id)
        
        if (playlistIndex !== -1) {
          this.playlists[playlistIndex].coverImage = null
          this.saveToLocalStorage()
          this.showSnackbar('Image supprimée', 'info')
        }
      }
      this.imageDialog = false
    },

    extractVideoId(url) {
      try {
        const urlObj = new URL(url)
        return urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop()
      } catch {
        return null
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('musicPlaylists', JSON.stringify(this.playlists))
    },

    loadFromLocalStorage() {
      const saved = localStorage.getItem('musicPlaylists')
      if (saved) {
        this.playlists = JSON.parse(saved)
      }
    },

    showSnackbar(message, color = 'success') {
      this.snackbarMessage = message
      this.snackbarColor = color
      this.snackbar = true
    }
  },

  mounted() {
    this.loadFromLocalStorage()
    console.log('Music Playlist Manager prêt')
  }
}
</script>

<style scoped>
.v-list-item {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
</style>