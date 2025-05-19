import { useRef, useState } from 'react'
import { format } from 'date-fns'
import {
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  LabelList,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { Calendar, TrendingDown, TrendingUp, X } from 'lucide-react'

import Button from '../components/Button'
import RangeSelectorPanel from '../components/RangeSelectorPanel'
import Combobox from '../components/Combobox'
import { useSettingsStore } from '../stores/settingsStore'
import { useBitsStore } from '../stores/bitsStore'
import { useBitTypesStore } from '../stores/bitTypesStore'
import { UserSettings } from '../types/UserSettings'

const MetricCard = ({
  title,
  value,
  trend,
  subtitle,
  float
}: {
  title: string
  value: number
  trend: number | null
  subtitle?: string
  float?: boolean
}) => (
  <div className="min-h-32 bg-scry-bg dark:bg-scry-bg-dark w-full flex flex-col p-2 border border-border dark:border-border-dark rounded-md">
    <p className="text-sm font-semibold">{title}</p>
    {value !== -1 ? (
      <>
        <p className="text-2xl font-bold">
          {typeof value === 'number' ? (float ? value.toFixed(4) : value) : value}
        </p>
        <div className="mt-2 flex items-center">
          {trend && typeof trend === 'number' ? (
            <>
              {trend >= 0 ? (
                <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="text-red-500 h-4 w-4 mr-1" />
              )}
              <p className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend >= 0 ? '+' : ''}
                {trend.toFixed(1)}% {subtitle}
              </p>
            </>
          ) : (
            <p className="text-sm text-text-muted">{subtitle}</p>
          )}
        </div>
      </>
    ) : (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-text-muted text-xl">No bits found</p>
      </div>
    )}
  </div>
)
const TotalBitCountChart = ({
  data,
  rangeType,
  settings
}: {
  data: [Date, number]
  rangeType: string
  settings: UserSettings
}) => {
  if (data[1] === -1) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-text-muted text-xl">No bits found</p>
      </div>
    )
  }

  const getTickFormatter = (date: Date) => {
    switch (rangeType) {
      case 'weekly':
        return format(new Date(date), 'dd EEE')
      case 'monthly':
        return format(new Date(date), 'dd')
      case 'yearly':
        return format(new Date(date), 'MMM')
      case 'custom':
        return format(new Date(date), 'dd EEE')
      case 'alltime':
        return format(new Date(date), 'MMM dd')
      default:
        return format(new Date(date), 'MMM dd')
    }
  }

  const getLabelFormatter = (label: string) => {
    switch (rangeType) {
      case 'monthly':
        return format(new Date(label), 'MMM dd')
      case 'yearly':
        return format(new Date(label), 'MMM')
      case 'custom':
        return format(new Date(label), 'MMM dd, yyyy')
      case 'alltime':
        return format(new Date(label), 'MMM dd, yyyy')
      default:
        return format(new Date(label), 'MMM dd')
    }
  }

  const tooltipStyle = {
    backgroundColor:
      settings.theme.mode === 'light' ? 'var(--color-scry-bg)' : 'var(--color-scry-bg-dark)',
    borderColor:
      settings.theme.mode === 'light' ? 'var(--color-border)' : 'var(--color-border-dark)',
    padding: '0.5rem'
  }

  const labelStyle = {
    fontWeight: 600,
    color: settings.theme.mode === 'light' ? 'var(--color-text)' : 'var(--color-text-dark)'
  }

  return (
    <ResponsiveContainer width="100%" height="75%">
      <AreaChart accessibilityLayer data={data}>
        <defs>
          <linearGradient id="colorValues" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={
                settings.theme.mode === 'light'
                  ? 'var(--color-scry-border)'
                  : 'var(--color-scry-border-dark)'
              }
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor={
                settings.theme.mode === 'light'
                  ? 'var(--color-scry-border)'
                  : 'var(--color-scry-border-dark)'
              }
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke={
            settings.theme.mode === 'light' ? 'var(--color-border)' : 'var(--color-border-dark)'
          }
          strokeOpacity={0.6}
          vertical={false}
        />
        <XAxis
          interval="preserveStartEnd"
          dataKey="interval"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={getTickFormatter}
        />
        <Tooltip
          separator=" "
          cursor={false}
          wrapperClassName="rounded-md"
          contentStyle={tooltipStyle}
          itemStyle={{ color: 'var(--color-text-muted)' }}
          labelStyle={labelStyle}
          labelFormatter={getLabelFormatter}
          formatter={(value, _) => [value, 'Bit Count']}
        />
        <Area
          type="monotone"
          dataKey="Count"
          stroke={
            settings.theme.mode === 'light' ? 'var(--color-gray-400)' : 'var(--color-gray-600)'
          }
          fillOpacity={0.4}
          fill="url(#colorValues)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const ActivityByHourChart = ({
  data,
  settings
}: {
  data: { name: Date; count: number }[]
  settings: UserSettings
}) => {
  if (!data[0] || data[0]?.count === -1) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-text-muted text-xl">No activity found</p>
      </div>
    )
  }

  const tooltipStyle = {
    backgroundColor:
      settings.theme.mode === 'light' ? 'var(--color-scry-bg)' : 'var(--color-scry-bg-dark)',
    borderColor:
      settings.theme.mode === 'light' ? 'var(--color-border)' : 'var(--color-border-dark)',
    padding: '0.5rem'
  }

  const labelStyle = {
    fontWeight: 600,
    color: settings.theme.mode === 'light' ? 'var(--color-text)' : 'var(--color-text-dark)'
  }

  return (
    <ResponsiveContainer width="100%" height="90%">
      <LineChart accessibilityLayer data={data}>
        <CartesianGrid
          stroke={
            settings.theme.mode === 'light' ? 'var(--color-border)' : 'var(--color-border-dark)'
          }
          strokeOpacity={0.6}
          vertical={false}
        />
        <XAxis
          interval="preserveStartEnd"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={14}
          dataKey="name"
          tickFormatter={(label) => format(new Date(label), 'HH')}
        />
        <Tooltip
          separator=" "
          cursor={false}
          wrapperClassName="rounded-md"
          contentStyle={tooltipStyle}
          itemStyle={{ color: 'var(--color-text-muted)' }}
          labelFormatter={(label) => format(new Date(label), 'HH:mm')}
          labelStyle={labelStyle}
          formatter={(value, _) => [value, 'Bit Count']}
        />
        <Line
          type="linear"
          dataKey="count"
          stroke={
            settings.theme.mode === 'light' ? 'var(--color-gray-400)' : 'var(--color-gray-600)'
          }
          fillOpacity={0.4}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

const MostUsedBitTypesChart = ({
  data,
  settings
}: {
  data: { name: string; count: number }[]
  settings: UserSettings
}) => {
  if (!data[0] || data[0]?.count === -1) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-text-muted text-xl">No bit types used</p>
      </div>
    )
  }

  const PIECOLORS = data.map((_: any, i: number) => {
    const minLightness = 20
    const maxLightness = 80
    const length = data.length
    const lightnessRange = maxLightness - minLightness
    const lightness =
      length === 1 ? maxLightness : maxLightness - (i * lightnessRange) / (length - 1)
    return `hsl(208, 40%, ${lightness}%)`
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart accessibilityLayer>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const entry = payload[0].payload
              return (
                <div
                  style={{
                    backgroundColor:
                      settings.theme.mode === 'light'
                        ? 'var(--color-scry-bg)'
                        : 'var(--color-scry-bg-dark)',
                    border: '1px solid',
                    borderColor:
                      settings.theme.mode === 'light'
                        ? 'var(--color-border)'
                        : 'var(--color-border-dark)',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    color: 'var(--color-text-muted)',
                    fontWeight: 'normal'
                  }}
                >
                  <div
                    style={{
                      fontWeight: '600',
                      color:
                        settings.theme.mode === 'light'
                          ? 'var(--color-text)'
                          : 'var(--color-text-dark)',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {entry.name}
                  </div>
                  <div>Type Count: {entry.count}</div>
                </div>
              )
            }
            return null
          }}
        />
        <Pie
          strokeWidth={0}
          innerRadius={70}
          outerRadius={120}
          data={data}
          dataKey="count"
          nameKey="name"
        >
          <LabelList
            strokeWidth={1}
            dataKey="name"
            stroke={settings.theme.mode === 'light' ? 'dimgray' : 'white'}
            fontSize={14}
          />
          {data.map((_: any, index: number) => (
            <Cell key={`cell-${index}`} fill={PIECOLORS[index % PIECOLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}

const AnalyticsPage = () => {
  const [mostUsedTop, setMostUsedTop] = useState(10)
  const [mostUsedHovered, setMostUsedHovered] = useState(false)
  const [rangeType, setRangeType] = useState('monthly')
  const [rangePanelOpened, setRangePanelOpened] = useState(false)
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')

  const rangeButton = useRef(null)

  const { settings } = useSettingsStore()
  const { bitTypes } = useBitTypesStore()
  const {
    getDailyAvgAnalytics,
    getTotalAvgAnalytics,
    getChartAnalytics,
    getMostUsedTypes,
    getActivityAnalytics
  } = useBitsStore()

  const totalAvg = getTotalAvgAnalytics(rangeType, rangeStart, rangeEnd)
  if (!totalAvg) return null

  const dailyAvg = getDailyAvgAnalytics(rangeType, rangeStart, rangeEnd)
  if (!dailyAvg) return null

  const totalChartData = getChartAnalytics(rangeType, rangeStart, rangeEnd)
  if (!totalChartData) return null

  const mostUsedTypesData = getMostUsedTypes(mostUsedTop)
  if (!mostUsedTypesData) return null

  const activityData = getActivityAnalytics()
  if (!activityData) return null

  console.log(totalChartData)

  const getRangeSubtitle = () => {
    if (rangeType === 'custom') {
      return `${format(rangeStart, 'dd MMM yyyy')} - ${format(rangeEnd, 'dd MMM yyyy')}`
    } else if (rangeType === 'alltime') {
      return 'All time'
    } else {
      return `compared to last ${rangeType.slice(0, -2)}`
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-12 flex items-center p-2">
        <div className="flex-1 h-full flex items-center drag-bar">
          <p className="ml-1 font-semibold">Analytics</p>
        </div>
        <Button
          onClick={() => window.ipcRenderer.invoke('closeWindow', 'analytics')}
          variant="icon"
          className="ml-auto"
        >
          <X size={16} strokeWidth={1.5} />
        </Button>
      </div>

      <div className="relative w-full bg-scry-bg dark:bg-scry-bg-dark border-y border-border dark:border-border-dark p-2 flex gap-2">
        <Button
          className="ml-auto"
          onClick={() => setRangePanelOpened((prev) => !prev)}
          ref={rangeButton}
        >
          {rangeType !== 'custom' ? (
            rangeType === 'alltime' ? (
              <p>All time</p>
            ) : (
              rangeType.charAt(0).toUpperCase() + rangeType.slice(1)
            )
          ) : (
            <p>
              {format(rangeStart, 'dd MMM yyyy')} - {format(rangeEnd, 'dd MMM yyyy')}
            </p>
          )}
          <Calendar size={16} strokeWidth={1.5} />
        </Button>

        {rangePanelOpened && (
          <RangeSelectorPanel
            top={6}
            right={48}
            isOpen={rangePanelOpened}
            rangeType={rangeType}
            setRangeType={setRangeType}
            toggleRangeSelector={() => setRangePanelOpened((prev) => !prev)}
            setCurrentDisplayDate={(date) => setRangeStart(date)}
            setCurrentDisplayDateEnd={(date) => setRangeEnd(date)}
            buttonRef={rangeButton}
            includeAllTime
          />
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col p-2 gap-2">
        <div className="flex w-full gap-2">
          <MetricCard
            title="Total Bits"
            value={totalAvg[0] ? totalAvg[0] : 0}
            trend={rangeType !== 'alltime' && rangeType !== 'custom' ? totalAvg[1] : null}
            subtitle={getRangeSubtitle()}
          />
          <MetricCard
            title="Avg. Daily Bits"
            value={dailyAvg[0] ? dailyAvg[0] : 0}
            trend={rangeType !== 'alltime' && rangeType !== 'custom' ? dailyAvg[1] : null}
            subtitle={getRangeSubtitle()}
            float
          />
          <MetricCard
            title="Bit Types"
            value={bitTypes.length > 0 ? bitTypes.length : -1}
            trend={null}
            subtitle="Total bit types in database"
          />
        </div>

        <div className="h-72 p-2 bg-scry-bg dark:bg-scry-bg-dark border border-border dark:border-border-dark rounded-md">
          <p className="font-semibold">Total Bit Count</p>
          <p className="text-sm text-text-muted">
            {rangeType !== 'custom'
              ? rangeType === 'alltime'
                ? 'All time'
                : `For this ${rangeType.slice(0, -2)}`
              : `between ${format(rangeStart, 'dd MMM yyyy')} - ${format(rangeEnd, 'dd MMM yyyy')}`}
          </p>
          <TotalBitCountChart data={totalChartData} rangeType={rangeType} settings={settings} />
        </div>

        <div className="flex gap-2 flex-1 h-full overflow-hidden">
          <div className="flex-1 p-2 bg-scry-bg dark:bg-scry-bg-dark border border-border dark:border-border-dark rounded-md">
            <p className="font-semibold">Avg. Activity by Hour</p>
            <p className="text-sm text-text-muted">All time</p>
            <ActivityByHourChart data={activityData} settings={settings} />
          </div>

          <div
            onMouseEnter={() => setMostUsedHovered(true)}
            onMouseLeave={() => setMostUsedHovered(false)}
            className="flex-1 p-2 bg-scry-bg dark:bg-scry-bg-dark border border-border dark:border-border-dark rounded-md"
          >
            <div className="flex items-center h-8 mt-1">
              <div className="flex flex-col">
                <p className="font-semibold">Most Used Bit Types</p>
                <p className="text-sm text-text-muted">Top {mostUsedTop} most used bit type</p>
              </div>
              {mostUsedHovered && (
                <Combobox
                  ghost
                  className="ml-auto w-48"
                  placeholder="Select top bits"
                  options={[
                    {
                      options: [
                        { value: '1', label: 'Top 1' },
                        { value: '3', label: 'Top 3' },
                        { value: '5', label: 'Top 5' },
                        { value: '10', label: 'Top 10' },
                        { value: '20', label: 'Top 20' },
                        { value: '50', label: 'Top 50' },
                        { value: '100', label: 'Top 100' }
                      ]
                    }
                  ]}
                  selectedValues={mostUsedTop.toString()}
                  onChange={(value) => {
                    setMostUsedTop(Number(value))
                  }}
                />
              )}
            </div>
            <MostUsedBitTypesChart data={mostUsedTypesData} settings={settings} />
          </div>
        </div>
      </div>

      <div className="p-2 h-12 mt-auto border-t border-border dark:border-border-dark"></div>
    </div>
  )
}

export default AnalyticsPage
