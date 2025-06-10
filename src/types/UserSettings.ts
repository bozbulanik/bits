export interface UserSettings {
  locale: {
    language: string

    timeSystem: {
      calendarType: string
      week: {
        startDay: string // GREGORIAN
        weekendDays: string[] // GREGORIAN
      }
      dateFormat: {
        type: string // GREGORIAN
        delimiter: string // GREGORIAN
        customPattern: string | null // GREGORIAN
      }
      timeFormat: {
        convention: '12-hour' | '24-hour' // GREGORIAN
        includeSeconds: boolean // GREGORIAN
        timeZoneDisplay: boolean // GREGORIAN
      }
    }
  }
  theme: {
    mode: 'light' | 'dark' | 'system'
    fontFamily: string
  }
  user: {
    name: string
    surname: string
    email: string
    profileImage: string
    bio: string
  }
  notifications: {
    reminders: boolean
    dailyCheckin: boolean
    updates: boolean
  }
  bitCreator: {
    defaultBitType: string
  }
  //   ai: {
  //     suggestionsEnabled: boolean
  //     verbosity: 'low' | 'medium' | 'high'
  //     temperature: number
  //   }
}
