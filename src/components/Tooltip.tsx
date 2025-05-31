import { AnimatePresence, motion } from 'framer-motion'
import React, { useRef, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import type { MouseEvent as ReactMouseEvent } from 'react'

type Trigger = 'hover' | 'click'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  mode: 'fixed' | 'cursor'
  offsetPosition?: [number, number]
  delayShow?: number
  delayHide?: number
  trigger?: Trigger
  className?: string
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  mode,
  offsetPosition = [0, 0],
  delayShow = 200,
  delayHide = 100,
  trigger = 'hover',
  className
}) => {
  const [visible, setVisible] = useState(false)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const showTimeout = useRef<NodeJS.Timeout | null>(null)
  const hideTimeout = useRef<NodeJS.Timeout | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const clearTimers = () => {
    if (showTimeout.current) clearTimeout(showTimeout.current)
    if (hideTimeout.current) clearTimeout(hideTimeout.current)
  }

  const showTooltip = () => {
    clearTimers()
    showTimeout.current = setTimeout(() => setVisible(true), delayShow)
  }

  const hideTooltip = () => {
    clearTimers()
    hideTimeout.current = setTimeout(() => setVisible(false), delayHide)
  }

  const toggleTooltip = () => {
    clearTimers()
    setVisible((v) => !v)
  }

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement, MouseEvent>) => {
    if (mode === 'cursor') {
      setCoords({ x: event.clientX + offsetPosition[0], y: event.clientY + offsetPosition[1] })
    }
  }

  useEffect(() => {
    if (!triggerRef.current || mode === 'cursor') return

    const rect = triggerRef.current.getBoundingClientRect()
    let top = 0,
      left = 0

    top = rect.top + offsetPosition[1]
    left = rect.left + offsetPosition[0]

    let transform = 'translate(-50%, -100%)'

    setStyle({ top, left, transform })
  }, [visible])

  const finalStyle = mode === 'cursor' ? { top: coords.y, left: coords.x, transform: 'translate(0, 0)' } : style

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        onMouseEnter={trigger === 'hover' ? showTooltip : undefined}
        onMouseLeave={trigger === 'hover' ? hideTooltip : undefined}
        onClick={trigger === 'click' ? toggleTooltip : undefined}
        onMouseMove={handleMouseMove}
      >
        {children}
      </div>
      {visible &&
        ReactDOM.createPortal(
          <AnimatePresence>
            {visible && (
              <motion.div
                key="tooltip"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed z-100 p-1.5 max-w-96 whitespace-pre-wrap h-auto text-text dark:text-text-dark text-sm bg-scry-bg dark:bg-scry-bg-dark border border-border dark:border-border-dark rounded-md whitespace-nowrap pointer-events-none"
                style={finalStyle}
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>,
          document.getElementById('tooltip-root')!
        )}
    </>
  )
}
