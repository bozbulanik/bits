import React, { useRef, useLayoutEffect, useState } from 'react'

interface SegmentOption {
  value: string
  label?: string
  icon?: React.ReactNode
}

interface SegmentedControlProps {
  segments: SegmentOption[]
  selectedOptionValue: string
  onChange: (value: string) => void
  className?: string
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ segments, selectedOptionValue, onChange, className }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    if (!containerRef.current) return
    const selected = containerRef.current.querySelector(`[data-value="${selectedOptionValue}"]`) as HTMLDivElement | null
    if (selected) {
      setSliderStyle({
        left: selected.offsetLeft,
        width: selected.offsetWidth
      })
    }
  }, [selectedOptionValue, segments])

  const handleClick = (value: string) => {
    onChange(value)
  }

  return (
    <div
      className={`relative flex gap-1 rounded-md h-7 p-0.5 bg-scry-bg dark:bg-scry-bg-dark border border-border dark:border-border-dark ${className}`}
      ref={containerRef}
    >
      <div
        className="absolute top-0 bottom-0 my-0.5 rounded-sm bg-bg dark:bg-button-bg-hover-dark transition-all duration-200 shadow-md"
        style={{
          left: sliderStyle.left,
          width: sliderStyle.width
        }}
      />

      {segments.map((segment) => (
        <div
          key={segment.value}
          data-value={segment.value}
          onClick={() => handleClick(segment.value)}
          className={`relative z-10 flex items-center gap-1 justify-center cursor-pointer rounded-md px-2 py-1 transition-colors duration-300 ${
            selectedOptionValue === segment.value ? 'font-semibold' : 'hover:bg-button-bg dark:hover:bg-button-bg-dark'
          }`}
        >
          {segment.icon}
          <p className="text-sm text-center">{segment.label}</p>
        </div>
      ))}
    </div>
  )
}

export default SegmentedControl
