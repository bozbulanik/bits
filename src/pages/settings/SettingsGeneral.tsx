import React, { useState } from 'react'
import Button from '../../components/Button'
import Combobox from '../../components/Combobox'
import Input from '../../components/Input'
import Switch from '../../components/Switch'
import Checkbox from '../../components/Checkbox'
import { useSettingsStore } from '../../stores/settingsStore'

const SettingsGeneral = () => {
  const { settings, setSetting } = useSettingsStore()

  const [appLanguage, setAppLanguage] = useState<string>(settings.locale.language)

  const languageOptions = [
    {
      options: [
        { value: 'en-GB', label: 'English' },
        { value: 'tr-TR', label: 'Turkish' }
      ]
    }
  ]
  const handleAppLanguage = (val: string) => {
    setAppLanguage(val)
    setSetting('locale.language', val)
  }

  const [calendarOption, setCalendarOption] = useState<string>(
    settings.locale.timeSystem.calendarType
  )
  const calendarOptions = [
    {
      options: [
        { value: 'gregorian', label: 'Gregorian' },
        { value: 'islamic', label: 'Islamic' },
        { value: 'chinese', label: 'Chinese' }
      ]
    }
  ]
  const handleCalendarOption = (val: string) => {
    setCalendarOption(val)
    setSetting('locale.timeSystem.calendarType', val)
  }

  const [checked, setChecked] = useState(false)

  // --- GREGORIAN ---

  const [startDay, setStartDay] = useState<string>(settings.locale.timeSystem.week.startDay)
  const days = [
    {
      options: [
        { value: 'sunday', label: 'Sunday' },
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' }
      ]
    }
  ]
  const handleStartDay = (val: string) => {
    setStartDay(val)
    setSetting('locale.timeSystem.week.startDay', val)
  }
  const [weekendDays, setWeekendDays] = useState<string[]>(
    settings.locale.timeSystem.week.weekendDays
  )
  const handleWeekendDays = (val: string[]) => {
    setWeekendDays(val)
    setSetting('locale.timeSystem.week.weekendDays', val)
  }
  const [dateFormat, setDateFormat] = useState<string>(settings.locale.timeSystem.dateFormat.type)
  const dateFormats = [
    {
      options: [
        { value: 'mm-dd-yyyy', label: '12-31-2025' },
        { value: 'dd-mm-yyyy', label: '31-12-2025' },
        { value: 'yyyy-mm-dd', label: '2025-12-31' },
        { value: 'yyyy-dd-mm', label: '2025-31-12' }
      ]
    }
  ]
  const handleDateFormat = (val: string) => {
    setDateFormat(val)
    setSetting('locale.timeSystem.dateFormat.type', val)
  }
  const [delimiter, setDelimiter] = useState<string>(
    settings.locale.timeSystem.dateFormat.delimiter
  )
  const handleDelimiter = (val: string) => {
    setDelimiter(val)
    setSetting('locale.timeSystem.dateFormat.delimiter', val)
  }
  const [customPattern, setCustomPattern] = useState<string | null>(
    settings.locale.timeSystem.dateFormat.customPattern
  )
  const handleCustomPattern = (val: string) => {
    setCustomPattern(val)
    setSetting('locale.timeSystem.dateFormat.customPattern', val)
  }
  const [timeConvention, setTimeConvention] = useState<string>(
    settings.locale.timeSystem.timeFormat.convention
  )
  const handleTimeConvention = (checked: boolean) => {
    setTimeConvention(checked ? '24-hour' : '12-hour')
    setSetting('locale.timeSystem.timeFormat.convention', checked ? '24-hour' : '12-hour')
  }
  const [includeSeconds, setIncludeSeconds] = useState<boolean>(
    settings.locale.timeSystem.timeFormat.includeSeconds
  )
  const handleIncludeSeconds = (checked: boolean) => {
    setIncludeSeconds(checked)
    setSetting('locale.timeSystem.timeFormat.includeSeconds', checked)
  }
  const [displayTimeZone, setDisplayTimeZone] = useState<boolean>(
    settings.locale.timeSystem.timeFormat.timeZoneDisplay
  )
  const handleDisplayTimeZone = (checked: boolean) => {
    setDisplayTimeZone(checked)
    setSetting('locale.timeSystem.timeFormat.timeZoneDisplay', checked)
  }
  return (
    <div className="w-full h-full flex flex-col gap-2 overflow-auto">
      <div className="flex flex-col gap-2 border-b border-border dark:border-border-dark p-2">
        <p className="text-text-muted uppercase text-sm font-semibold">Locale</p>
        <div className="flex items-start">
          <div className="flex flex-col flex-1">
            <p className="text-sm font-semibold">Language</p>
            <p className="text-sm text-text-muted">Interface language of the application</p>
          </div>
          <Combobox
            className="w-48 ml-auto"
            searchable
            selectedValues={appLanguage}
            options={languageOptions}
            onChange={(value) => handleAppLanguage(value as string)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2">
        <p className="text-text-muted uppercase text-sm font-semibold">Time</p>
        <div className="flex items-center">
          <div className="flex flex-col flex-1">
            <p className="text-sm font-semibold">Calendar Type</p>
            <p className="text-sm text-text-muted">Calendar type for time and data display</p>
          </div>
          <Combobox
            className="w-48 ml-auto"
            selectedValues={calendarOption}
            options={calendarOptions}
            placeholder="Select calendar type"
            onChange={(value) => handleCalendarOption(value as string)}
          />
        </div>
        {calendarOption == 'gregorian' && (
          <div className="flex flex-col gap-2 bg-scry-bg dark:bg-scry-bg-dark border border-border dark:border-border-dark rounded-md">
            <div className="flex flex-col gap-2 border-b border-border dark:border-border-dark p-2">
              <p className="text-text-muted uppercase text-sm font-semibold">Week</p>
              <div className="flex items-center">
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-semibold">Start Day</p>
                  <p className="text-sm text-text-muted">Which day the week starts</p>
                </div>
                <Combobox
                  className="w-48 ml-auto"
                  selectedValues={startDay}
                  options={days}
                  onChange={(value) => handleStartDay(value as string)}
                />
              </div>
              <div className="flex items-center">
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-semibold">Weekend Days</p>
                  <p className="text-sm text-text-muted">Which days are considered end</p>
                </div>
                <Combobox
                  className="w-48 ml-auto"
                  selectedValues={weekendDays}
                  options={days}
                  multiSelect
                  placeholder="Select weekend days"
                  onChange={(values) => handleWeekendDays(values as string[])}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 border-b border-border dark:border-border-dark p-2">
              <p className="text-text-muted uppercase text-sm font-semibold">Date</p>
              <div className="flex items-center">
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-semibold">Date Format</p>
                  <p className="text-sm text-text-muted">Format of the date</p>
                </div>
                <Combobox
                  className="w-48 ml-auto"
                  selectedValues={dateFormat}
                  options={dateFormats}
                  onChange={(value) => handleDateFormat(value as string)}
                />
              </div>
              <div className="flex items-center">
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-semibold">Delimiter</p>
                  <p className="text-sm text-text-muted">Custom delimiter for the date</p>
                </div>
                <Input
                  value={delimiter}
                  onChange={(e) => handleDelimiter(e.target.value)}
                  className="w-48 ml-auto"
                  placeholder="E.g. [ / ] [ . ] [ - ] [ , ]"
                />
              </div>
              <div className="flex items-center">
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-semibold">Custom Pattern</p>
                  <p className="text-sm text-text-muted">
                    You can provide custom pattern for the date. ISO codes with delimiters are
                    accepted. Settings above are dismissed when a custom pattern is specified.
                  </p>
                </div>
                <Input
                  value={customPattern as string}
                  onChange={(e) => handleCustomPattern(e.target.value)}
                  className="w-48 ml-auto"
                  placeholder="E.g. dd, mm yyyy"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 border-b border-border dark:border-border-dark p-2">
              <p className="text-text-muted uppercase text-sm font-semibold">Time Format</p>
              <div className="flex items-center">
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-semibold">Convention</p>
                  <p className="text-sm text-text-muted">12 hours or 24 hours</p>
                </div>
                <Switch
                  reversed
                  className="ml-auto"
                  checked={timeConvention == '12-hour' ? false : true}
                  onChange={handleTimeConvention}
                  onText="24 Hours"
                  offText="12 Hours"
                />
              </div>
              <div className="flex items-center">
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-semibold">Include Seconds</p>
                  <p className="text-sm text-text-muted">Include seconds in the time</p>
                </div>
                <Checkbox
                  className="ml-auto"
                  checked={includeSeconds}
                  onChange={handleIncludeSeconds}
                />
              </div>
              <div className="flex items-center">
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-semibold">Display Time Zone</p>
                  <p className="text-sm text-text-muted">Display the time zone in the time</p>
                </div>
                <Checkbox
                  className="ml-auto"
                  checked={displayTimeZone}
                  onChange={handleDisplayTimeZone}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsGeneral
