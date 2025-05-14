import fetch from 'node-fetch'
import Store from 'electron-store'

const store = new Store()

interface GoogleFontsResponse {
  items: Array<{
    family: string
    variants: string[]
    subsets: string[]
    version: string
    files: { [key: string]: string }
    category: string
    kind: string
  }>
}

interface FontOption {
  value: string
  label: string
}

interface CachedData {
  fonts: FontOption[]
  timestamp: number
}

const API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY
const GOOGLE_FONTS_API = 'https://www.googleapis.com/webfonts/v1/webfonts'
const CACHE_KEY = 'google_fonts_cache'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export const fetchGoogleFonts = async (): Promise<FontOption[]> => {
  const cachedData = store.get(CACHE_KEY) as CachedData | undefined
  if (cachedData) {
    const { fonts, timestamp } = cachedData
    if (timestamp && Date.now() - timestamp < CACHE_EXPIRY) {
      return fonts
    }
  }

  try {
    const res = await fetch(`${GOOGLE_FONTS_API}?key=${API_KEY}&sort=popularity`)
    const data = (await res.json()) as GoogleFontsResponse
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error('Error when fetching fonts.')
    }

    const fonts = data.items.map((font) => ({
      value: font.family,
      label: font.family
    }))

    store.set(CACHE_KEY, {
      fonts,
      timestamp: Date.now()
    })

    return fonts
  } catch (error) {
    console.error('Failed to fetch Google Fonts:', error)
    throw error
  }
}
