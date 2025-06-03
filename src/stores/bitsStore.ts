import { create } from 'zustand'
import { Bit, BitData, BitTypeDefinition, Note } from '../types/Bit'
import {
  addDays,
  differenceInCalendarDays,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  getDaysInMonth,
  getDaysInYear,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isWithinInterval,
  setHours,
  startOfDay,
  startOfMonth,
  startOfToday,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears
} from 'date-fns'

interface BitsStore {
  isLoading: boolean
  loadError: Error | null
  bits: Bit[]
  loadBits: () => Promise<void>
  addBit: (type: BitTypeDefinition, data: BitData[]) => Promise<void>
  addBitNote: (bitId: string, content: string) => Promise<void>

  updateBit: (id: string, data: BitData[]) => Promise<void>
  updateBitNote: (id: string, bitId: string, content: string) => Promise<void>
  togglePin: (id: string) => Promise<void>

  deleteBit: (id: string) => Promise<void>
  deleteBitNote: (id: string, bitId: string) => Promise<void>

  searchBits: (query: string) => Bit[]
  getBitById: (id: string) => Bit | undefined
  getPinnedBits: () => Bit[]
  getBitsByTypeId: (typeId: string) => Bit[]

  getDailyAvgAnalytics: (type: string, from: string, to: string) => [number, number] | undefined
  getTotalAvgAnalytics: (type: string, from: string, to: string) => [number, number] | undefined
  getChartAnalytics: (type: string, from: string, to: string) => { name: Date; count: number }[] | undefined
  getMostUsedTypes: (top: number) => { name: string; count: number }[] | undefined
  getActivityAnalytics: () => { name: Date; count: number }[] | undefined
  getBitCountByType: (typeId: string) => number

  pinnedBits: Bit[]
  getPinnedBitsDB: () => Promise<void>
}

export const useBitsStore = create<BitsStore>((set, get) => {
  if (typeof window !== 'undefined' && window.ipcRenderer) {
    window.ipcRenderer.on('bits-updated', (_, structuredBits) => {
      set({ bits: structuredBits, isLoading: false })
    })
  }

  return {
    bits: [],
    isLoading: false,
    loadError: null,
    loadBits: async () => {
      const startTime = performance.now()
      const startMemory = await getMemoryUsage()
      set({ isLoading: true, loadError: null })
      try {
        const ipcStart = performance.now()
        const structuredBits = await window.ipcRenderer.invoke('getStructuredBits')
        const ipcDuration = performance.now() - ipcStart
        console.log(`IPC call took ${Math.round(ipcDuration)}ms`)
        set({ bits: structuredBits, isLoading: false })
      } catch (err) {
        console.error('Failed to fetch bits', err)
        set({ loadError: err as Error, isLoading: false })
      }
      const loadTime = performance.now() - startTime
      const endMemory = await getMemoryUsage()

      console.log(`Loaded bits in ${Math.round(loadTime)}ms`)
      console.log(`Estimated memory usage: ${Math.round(endMemory - startMemory)}MB`)
    },

    addBit: async (type, data) => {
      const newBit: Bit = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: 0,
        type,
        notes: [],
        data
      }

      set((state) => ({ bits: [...state.bits, newBit] }))

      try {
        await window.ipcRenderer.invoke('addBit', newBit.id, newBit.type.id, newBit.createdAt, newBit.updatedAt, newBit.pinned, newBit.data)
      } catch (error) {
        console.error('Failed to add bit:', error)
        set((state) => ({
          bits: state.bits.filter((bit) => bit.id !== newBit.id),
          loadError: error as Error
        }))
      }
    },
    addBitNote: async (bitId, content) => {
      const originalNotes = get().bits.find((bit) => bit.id === bitId)?.notes || []

      const newNote: Note = {
        id: crypto.randomUUID(),
        bitId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content
      }

      set((state) => ({ bits: state.bits.map((bit) => (bit.id === bitId ? { ...bit, notes: [...(bit.notes || []), newNote] } : bit)) }))

      try {
        await window.ipcRenderer.invoke('addBitNote', newNote)
      } catch (error) {
        console.error('Failed to add note:', error)
        set((state) => ({
          bits: state.bits.map((bit) =>
            bit.id === bitId
              ? {
                  ...bit,
                  notes: originalNotes
                }
              : bit
          ),
          loadError: error as Error
        }))
      }
    },

    updateBit: async (id, data) => {
      const previousBits = get().bits
      const timeStamp = new Date().toISOString()

      set((state) => ({
        bits: state.bits.map((bit) => (bit.id === id ? { ...bit, updatedAt: timeStamp, data } : bit))
      }))

      try {
        await window.ipcRenderer.invoke('updateBit', id, data, timeStamp)
      } catch (error) {
        console.error('Failed to update bit:', error)
        set({
          bits: previousBits,
          loadError: error as Error
        })
      }
    },
    updateBitNote: async (id, bitId, content) => {
      const bit = get().bits.find((bit) => bit.id === bitId)
      const originalNotes = bit?.notes || []
      const timeStamp = new Date().toISOString()
      const updatedNotes = originalNotes.map((note) => (note.id === id ? { ...note, updatedAt: timeStamp, content: content } : note))

      set((state) => ({
        bits: state.bits.map((bit) => (bit.id === bitId ? { ...bit, notes: updatedNotes } : bit))
      }))

      try {
        await window.ipcRenderer.invoke('updateBitNote', id, content, timeStamp)
      } catch (error) {
        console.error('Failed to update note:', error)
        set((state) => ({
          bits: state.bits.map((bit) => (bit.id === bitId ? { ...bit, notes: originalNotes } : bit)),
          loadError: error as Error
        }))
      }
    },
    togglePin: async (id) => {
      const previousBits = get().bits

      const bitToToggle = previousBits.find((bit) => bit.id === id)
      if (!bitToToggle) return

      const newPinnedValue = bitToToggle.pinned ? 0 : 1
      const timeStamp = new Date().toISOString()

      set((state) => ({
        bits: state.bits.map((bit) => (bit.id === id ? { ...bit, updatedAt: timeStamp, pinned: newPinnedValue } : bit))
      }))
      try {
        await window.ipcRenderer.invoke('togglePin', id, newPinnedValue, timeStamp)
      } catch (error) {
        console.error('Failed to pin/unpin bit:', error)
        set({
          bits: previousBits,
          loadError: error as Error
        })
      }
    },

    deleteBit: async (id) => {
      const previousBits = get().bits
      set((state) => ({
        bits: state.bits.filter((bit) => bit.id !== id)
      }))

      try {
        await window.ipcRenderer.invoke('deleteBit', id)
      } catch (error) {
        console.error('Failed to delete bit:', error)
        set({
          bits: previousBits,
          loadError: error as Error
        })
      }
    },
    deleteBitNote: async (id, bitId) => {
      const originalNotes = get().bits.find((bit) => bit.id === bitId)?.notes || []

      const updatedNotes = originalNotes.filter((note) => note.id !== id)

      set((state) => ({
        bits: state.bits.map((bit) => (bit.id === bitId ? { ...bit, notes: updatedNotes } : bit))
      }))

      try {
        await window.ipcRenderer.invoke('deleteBitNote', id)
      } catch (error) {
        console.error('Failed to delete note:', error)
        set((state) => ({
          bits: state.bits.map((bit) => (bit.id === bitId ? { ...bit, notes: originalNotes } : bit)),
          loadError: error as Error
        }))
      }
    },

    searchBits: (query): Bit[] => {
      const allBits = get().bits
      return allBits.filter((bit) => recursiveSearch(bit, query.toLowerCase()))
    },
    getBitById: (id) => {
      const { bits } = get()
      return bits.find((bit: Bit) => bit.id === id)
    },
    getPinnedBits: () => {
      const { bits } = get()
      return bits.filter((bit: Bit) => bit.pinned === 1)
    },
    getBitsByTypeId: (typeId) => {
      const { bits } = get()
      return bits.filter((bit: Bit) => typeId == bit.type.id)
    },

    getDailyAvgAnalytics: (type, from, to) => {
      const today = startOfToday()
      const allBits = get().bits
      if (allBits.length == 0) return [-1, -1]
      const allBitsDates = allBits.map((bit) => ({ ...bit, date: new Date(bit.createdAt) }))

      const countByFilter = (filterFn: any) => allBitsDates.filter(filterFn).length

      const percentChange = (current: number, previous: number) => {
        if (previous === 0) return current === 0 ? 0 : 100
        return ((current - previous) / previous) * 100
      }

      switch (type) {
        case 'weekly': {
          const bitsThisWeek = countByFilter((bit: any) => isThisWeek(bit.date))
          const bitsLastWeek = countByFilter((bit: any) => isLastWeek(bit.date))

          const avgThisWeek = bitsThisWeek / 7
          const avgLastWeek = bitsLastWeek / 7

          return [avgThisWeek, percentChange(avgThisWeek, avgLastWeek)]
        }

        case 'monthly': {
          const daysInMonth = getDaysInMonth(today)

          const bitsThisMonth = countByFilter((bit: any) => isThisMonth(bit.date))
          const bitsLastMonth = countByFilter((bit: any) => isLastMonth(bit.date))

          const avgThisMonth = bitsThisMonth / daysInMonth
          const daysLastMonth = getDaysInMonth(subMonths(today, 1))
          const avgLastMonth = bitsLastMonth / daysLastMonth

          return [avgThisMonth, percentChange(avgThisMonth, avgLastMonth)]
        }

        case 'yearly': {
          const daysInYear = getDaysInYear(today)

          const bitsThisYear = countByFilter((bit: any) => isThisYear(bit.date))
          const bitsLastYear = countByFilter((bit: any) => isLastYear(bit.date))

          const avgThisYear = bitsThisYear / daysInYear
          const daysLastYear = getDaysInYear(subYears(today, 1))
          const avgLastYear = bitsLastYear / daysLastYear

          return [avgThisYear, percentChange(avgThisYear, avgLastYear)]
        }

        case 'custom': {
          if (!from || !to) return [0, 0]

          const fromDate = new Date(from)
          const toDate = new Date(to)
          const days = Math.max(1, differenceInCalendarDays(toDate, fromDate) + 1)

          const bitsInRange = countByFilter((bit: any) => bit.date >= fromDate && bit.date <= toDate)
          const avgInRange = bitsInRange / days

          const prevFrom = subDays(fromDate, days)
          const prevTo = subDays(toDate, days)
          const bitsPrevRange = countByFilter((bit: any) => bit.date >= prevFrom && bit.date <= prevTo)
          const avgPrevRange = bitsPrevRange / days

          return [avgInRange, percentChange(avgInRange, avgPrevRange)]
        }
        case 'alltime': {
          if (allBitsDates.length === 0) return [0, 0]

          const sortedBits = allBitsDates.sort((a, b) => a.date.getTime() - b.date.getTime())
          const firstDate = sortedBits[0].date
          const lastDate = today

          const totalDays = Math.max(1, differenceInCalendarDays(lastDate, firstDate) + 1)
          const totalBits = allBitsDates.length
          const avgAllTime = totalBits / totalDays

          return [avgAllTime, 0]
        }

        default:
          return [0, 0]
      }
    },
    getTotalAvgAnalytics: (type, from, to) => {
      const allBits = get().bits
      if (allBits.length == 0) return [-1, -1]
      const allBitsDates = allBits.map((bit) => ({ ...bit, date: new Date(bit.createdAt) }))

      const countByFilter = (filterFn: any) => allBitsDates.filter(filterFn).length

      const percentChange = (current: number, previous: number) => {
        if (previous === 0) return current === 0 ? 0 : 100
        return ((current - previous) / previous) * 100
      }

      switch (type) {
        case 'weekly': {
          const bitsThisWeek = countByFilter((bit: any) => isThisWeek(bit.date))
          const bitsLastWeek = countByFilter((bit: any) => isLastWeek(bit.date))

          return [bitsThisWeek, percentChange(bitsThisWeek, bitsLastWeek)]
        }

        case 'monthly': {
          const bitsThisMonth = countByFilter((bit: any) => isThisMonth(bit.date))
          const bitsLastMonth = countByFilter((bit: any) => isLastMonth(bit.date))

          return [bitsThisMonth, percentChange(bitsThisMonth, bitsLastMonth)]
        }

        case 'yearly': {
          const bitsThisYear = countByFilter((bit: any) => isThisYear(bit.date))
          const bitsLastYear = countByFilter((bit: any) => isLastYear(bit.date))

          return [bitsThisYear, percentChange(bitsThisYear, bitsLastYear)]
        }

        case 'custom': {
          if (!from || !to) return [0, 0]

          const fromDate = new Date(from)
          const toDate = new Date(to)
          const days = Math.max(1, differenceInCalendarDays(toDate, fromDate) + 1)

          const bitsInRange = countByFilter((bit: any) => bit.date >= fromDate && bit.date <= toDate)
          const prevFrom = subDays(fromDate, days)
          const prevTo = subDays(toDate, days)
          const bitsPrevRange = countByFilter((bit: any) => bit.date >= prevFrom && bit.date <= prevTo)

          return [bitsInRange, percentChange(bitsInRange, bitsPrevRange)]
        }
        case 'alltime': {
          return [allBits.length, 0]
        }

        default:
          return [0, 0]
      }
    },
    getChartAnalytics: (type, from, to) => {
      const allBits = get().bits
      if (allBits.length == 0) return [{ name: new Date(), count: -1 }]

      const allBitsDates = allBits.map((bit) => ({ ...bit, date: new Date(bit.createdAt) }))

      const today = startOfToday()

      let intervals: any = []
      let getIntervalKey
      switch (type) {
        case 'weekly':
          intervals = eachDayOfInterval({
            start: subDays(today, 3),
            end: addDays(today, 3)
          })
          getIntervalKey = (date: any) => format(date, 'yyyy-MM-dd')
          break
        case 'monthly':
          intervals = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) })
          getIntervalKey = (date: any) => format(date, 'yyyy-MM-dd')
          break
        case 'yearly':
          intervals = eachMonthOfInterval({ start: startOfYear(today), end: endOfYear(today) })
          getIntervalKey = (date: any) => format(startOfMonth(date), 'yyyy-MM-dd')
          break
        case 'custom': {
          const start = new Date(from)
          const end = new Date(to)

          const daysDiff = differenceInDays(end, start)
          const monthsDiff = differenceInMonths(end, start)
          const yearsDiff = differenceInYears(end, start)

          if (daysDiff <= 30) {
            intervals = eachDayOfInterval({ start, end })
            getIntervalKey = (date: any) => format(date, 'yyyy-MM-dd')
          } else if (monthsDiff >= 3 && yearsDiff < 1) {
            intervals = eachMonthOfInterval({ start, end })
            getIntervalKey = (date: any) => format(date, 'yyyy-MM')
          } else if (yearsDiff >= 1) {
            intervals = eachYearOfInterval({ start, end })
            getIntervalKey = (date: any) => format(date, 'yyyy')
          } else {
            intervals = eachMonthOfInterval({ start, end })
            getIntervalKey = (date: any) => format(date, 'yyyy-MM')
          }

          break
        }
        case 'alltime': {
          const sortedBits = allBitsDates.sort((a, b) => a.date.getTime() - b.date.getTime())
          const start = startOfDay(sortedBits[0].date)
          const end = endOfDay(sortedBits[sortedBits.length - 1].date)

          const daysDiff = differenceInDays(end, start)
          const monthsDiff = differenceInMonths(end, start)
          const yearsDiff = differenceInYears(end, start)

          if (daysDiff <= 30) {
            intervals = eachDayOfInterval({ start, end })
            getIntervalKey = (date: any) => format(date, 'yyyy-MM-dd')
          } else if (monthsDiff >= 3 && yearsDiff < 1) {
            intervals = eachMonthOfInterval({ start, end })
            getIntervalKey = (date: any) => format(date, 'yyyy-MM')
          } else if (yearsDiff >= 1) {
            intervals = eachYearOfInterval({ start, end })
            getIntervalKey = (date: any) => format(date, 'yyyy')
          } else {
            // fallback for intermediate ranges (e.g., 1–3 months)
            intervals = eachMonthOfInterval({ start, end })
            getIntervalKey = (date: any) => format(date, 'yyyy-MM')
          }

          break
        }
        default:
          return []
      }

      const counts = new Map()

      for (const bit of allBitsDates) {
        const key = getIntervalKey(bit.date)
        counts.set(key, (counts.get(key) || 0) + 1)
      }

      const result = intervals.map((date: any) => {
        const key = getIntervalKey(date)
        return {
          name: date,
          count: counts.get(key) || 0
        }
      })

      return result
    },
    getMostUsedTypes: (top: number) => {
      const allBits = get().bits
      const typeCounts: Record<string, { id: string; name: string; count: number }> = {}

      for (const bit of allBits) {
        const type = bit.type
        const typeId = typeof type === 'string' ? type : type.id
        const typeName = typeof type === 'string' ? type : type.name

        if (!typeCounts[typeId]) {
          typeCounts[typeId] = { id: typeId, name: typeName, count: 0 }
        }

        typeCounts[typeId].count += 1
      }

      const mostUsedTypes = Object.values(typeCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, top)

      return mostUsedTypes
    },
    getActivityAnalytics: () => {
      const allBits = get().bits
      if (allBits.length == 0) return [{ name: new Date(), count: -1 }]

      const today = startOfToday()

      const hourlyCounts = Array.from({ length: 24 }, (_, hour) => ({
        name: setHours(today, hour),
        count: 0
      }))

      allBits.forEach((bit) => {
        const date = new Date(bit.createdAt)
        const hour = date.getHours()
        hourlyCounts[hour].count++
      })

      return hourlyCounts
    },
    getBitCountByType: (typeId: string) => {
      const { bits } = get()
      return bits.filter((bit) => bit.type.id === typeId).length
    },

    pinnedBits: [],
    getPinnedBitsDB: async () => {
      try {
        const structuredPinnedBits = await window.ipcRenderer.invoke('getStructuredPinnedBits')
        set({ pinnedBits: structuredPinnedBits })
      } catch (err) {
        console.error('Failed to fetch bits', err)
      }
    }
  }
})

const IGNORED_KEYS = ['id', 'type', 'createdAt', 'updatedAt', 'pinned']
function recursiveSearch(obj: any, query: string): boolean {
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj.toString().toLowerCase().includes(query)
  }

  if (Array.isArray(obj)) {
    return obj.some((item) => recursiveSearch(item, query))
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).some(([key, value]) => {
      if (IGNORED_KEYS.includes(key)) return false
      return recursiveSearch(value, query)
    })
  }

  return false
}

const isLastWeek = (date: any) => {
  const lastWeekStart = startOfWeek(subWeeks(new Date(), 1))
  const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1))
  return isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd })
}
const isLastMonth = (date: any) => {
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1))
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1))
  return isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd })
}
const isLastYear = (date: any) => {
  const lastYearStart = startOfYear(subYears(new Date(), 1))
  const lastYearEnd = endOfYear(subYears(new Date(), 1))
  return isWithinInterval(date, { start: lastYearStart, end: lastYearEnd })
}

const getMemoryUsage = async () => {
  try {
    const memInfo = await window.ipcRenderer.invoke('getMemoryUsage')
    return memInfo.heap.external
  } catch (error) {
    console.warn('Memory info not available:', error)
    return 0
  }
}
