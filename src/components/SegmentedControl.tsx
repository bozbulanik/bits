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
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  selectedOptionValue,
  onChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    if (!containerRef.current) return
    const selected = containerRef.current.querySelector(
      `[data-value="${selectedOptionValue}"]`
    ) as HTMLDivElement | null
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
      className="relative flex gap-1 rounded-md h-8 p-1 bg-scry-bg dark:bg-scry-bg-dark border border-border dark:border-border-dark"
      ref={containerRef}
    >
      <div
        className="absolute top-0 bottom-0 my-1 rounded-sm bg-button-bg-hover dark:bg-button-bg-hover-dark transition-all duration-200"
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
          className={`relative z-10 flex items-center gap-2 justify-center cursor-pointer rounded-md px-3 py-1 transition-colors duration-300 ${
            selectedOptionValue === segment.value
              ? 'font-semibold'
              : 'hover:bg-button-bg dark:hover:bg-button-bg-dark'
          }`}
        >
          {segment.icon}
          <p className="text-sm">{segment.label}</p>
        </div>
      ))}
    </div>
  )
}

export default SegmentedControl
