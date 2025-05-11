import { useNavigate } from 'react-router-dom'
import Input from '../../components/Input'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Space } from 'lucide-react'
import KeyCompponent from '../../components/KeyComponent'
import Button from '../../components/Button'

const ConfigurationUser = () => {
  const navigate = useNavigate()
  return (
    <div className="w-full h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -25 }}
        transition={{ duration: 0.4 }}
        className="w-full h-full flex flex-col items-center p-4 gap-2"
      >
        <p className="text-4xl font-thin my-12">Let us know you better</p>
        <p>What should we call you?</p>
        <div className="flex gap-2">
          <Input variant={'ghost'} placeholder="Your name..." />
        </div>
      </motion.div>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.8 }}
          className="flex gap-2 p-2 items-center text-text-muted justify-between"
        >
          <Button onClick={() => navigate('/configuration')} variant={'ghost'}>
            <ChevronLeft size={16} strokeWidth={1.5} /> Back
          </Button>
          <div className="flex gap-2 items-center">
            <p className="text-text-muted font-thin">Start</p>
            <hr className="w-12 border-border dark:border-border-dark" />
            <p className="">Personal</p>
            <hr className="w-12 border-border dark:border-border-dark" />
            <p className="text-text-muted font-thin">Theme</p>
          </div>
          <Button onClick={() => navigate('/configuration')} variant={'ghost'}>
            Next
            <ChevronRight size={16} strokeWidth={1.5} />
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default ConfigurationUser
