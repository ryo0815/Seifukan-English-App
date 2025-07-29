import { motion } from 'framer-motion'
import { Lock, PlayCircle, Check, Shield, Sword, Star } from 'lucide-react'

type Status = 'locked' | 'active' | 'completed'

interface StageNodeMotionProps {
  id: string
  title: string
  description: string
  status: Status
  onClick: () => void
}

const stageIcons = {
  'stage-0': Shield,
  'stage-1': Sword,
  'stage-2': Star
}

export default function StageNodeMotion({
  id,
  title,
  description,
  status,
  onClick,
}: StageNodeMotionProps) {
  const IconComponent = stageIcons[id as keyof typeof stageIcons] || Shield

  const variants = {
    locked: { 
      scale: 0.9, 
      opacity: 0.6,
      transition: { duration: 0.3 }
    },
    active: {
      scale: 1,
      opacity: 1,
      y: [0, -6, 0],
      transition: { 
        duration: 2, 
        repeat: Infinity, 
        repeatType: 'mirror' as const,
        ease: 'easeInOut' as const
      },
    },
    completed: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.3 }
    },
  }

  const getNodeClasses = () => {
    switch (status) {
      case 'locked':
        return 'border-2 border-gray-300 bg-gray-100 text-gray-400 shadow-md'
      case 'active':
        return 'border-4 border-[#58CC02] bg-white text-[#58CC02] shadow-lg shadow-green-200'
      case 'completed':
        return 'bg-[#58CC02] text-white shadow-lg shadow-green-200'
      default:
        return 'border-2 border-gray-300 bg-gray-100 text-gray-400 shadow-md'
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'locked':
        return <Lock className="w-6 h-6" />
      case 'active':
        return <IconComponent className="w-6 h-6" />
      case 'completed':
        return <Check className="w-6 h-6" />
      default:
        return <Lock className="w-6 h-6" />
    }
  }

  return (
    <motion.button
      className="flex flex-col items-center gap-3 group relative"
      onClick={status !== 'locked' ? onClick : undefined}
      aria-label={`ステージ: ${title}`}
      whileHover={status !== 'locked' ? { scale: 1.05, y: -2 } : {}}
      whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
      initial="locked"
      animate={status}
    >
      {/* Stage Node */}
      <motion.div 
        className={`relative flex items-center justify-center rounded-full w-20 h-20 sm:w-24 sm:h-24 ${getNodeClasses()}`}
        variants={variants}
      >
        {getIcon()}
        
        {/* Completion Badge */}
        {status === 'completed' && (
          <motion.div
            className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-xs font-bold text-yellow-900">✓</span>
          </motion.div>
        )}

        {/* Active Glow Effect */}
        {status === 'active' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-green-400 opacity-20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {/* Stage Title */}
      <div className="text-center w-full max-w-[120px]">
        <motion.span 
          className="text-sm font-bold text-gray-800 block truncate"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.span>
      </div>

      {/* Hover Effect */}
      {status !== 'locked' && (
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-medium opacity-0 pointer-events-none"
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          クリックして開始
        </motion.div>
      )}
    </motion.button>
  )
} 