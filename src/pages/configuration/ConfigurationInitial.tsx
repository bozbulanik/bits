import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Space } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Switch from '../../components/Switch'
import KeyCompponent from '../../components/KeyComponent'

const ConfigurationInitial = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        navigate('/configuration/user')
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  return (
    <div className="w-full h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -25 }}
        transition={{ duration: 0.4 }}
        className="w-full h-full flex items-center justify-center"
      >
        <p className="text-4xl font-thin my-1">Welcome to Bits</p>
      </motion.div>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.8 }}
          className="w-full flex gap-2 p-2 items-center justify-center text-text-muted"
        >
          <div className="flex gap-2 items-center">
            Please press
            <KeyCompponent>
              <Space size={16} strokeWidth={1.5} />
            </KeyCompponent>
            to proceed
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default ConfigurationInitial
