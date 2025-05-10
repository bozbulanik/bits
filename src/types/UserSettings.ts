export interface UserSettings {
  locale: {
    language: string

    timeSystem: {
      calendarType: string
      week: {
        startDay: string
        weekendDays: string[]
        length: number
      }
      dateFormat: {
        type: string
        delimiter: string
        customPattern: string | null
      }
      timeFormat: {
        convention: '12-hour' | '24-hour'
        includeSeconds: boolean
        timeZoneDisplay: boolean
      }
    }
    // timezone: string
    // dateFormat: string
    // timeConvention: '12' | '24'
    // weekStart: string
    // calendar: string
  }
  theme: {
    mode: 'light' | 'dark' | 'system'
    fontSize: 'small' | 'medium' | 'large'
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
  //   ai: {
  //     suggestionsEnabled: boolean
  //     verbosity: 'low' | 'medium' | 'high'
  //     temperature: number
  //   }
}
