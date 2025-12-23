import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export const vuetify = createVuetify({
  components,
  directives,

  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#5865F2',
          secondary: '#2F3136',
          background: '#121212',
          surface: '#1E1E1E',
          error: '#EF4444',
          success: '#22C55E'
        }
      },
      light: {
        dark: false,
        colors: {
          primary: '#3B82F6',
          secondary: '#E5E7EB',
          background: '#FFFFFF',
          surface: '#F9FAFB',
          error: '#DC2626',
          success: '#16A34A'
        }
      }
    }
  }
})
