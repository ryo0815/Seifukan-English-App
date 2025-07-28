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
        return 'border-2 border-gray-300 bg-gray-100 text-gray-400'
      case 'active':
        return 'border-4 border-[#58CC02] bg-white text-[#58CC02] shadow-lg'
      case 'completed':
        return 'bg-[#58CC02] text-white shadow-lg'
      default:
        return 'border-2 border-gray-300 bg-gray-100 text-gray-400'
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
      className="flex flex-col items-center gap-2 group"
      onClick={status !== 'locked' ? onClick : undefined}
      aria-label={`ステージ: ${title}`}
      whileHover={status !== 'locked' ? { scale: 1.05 } : {}}
      whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
      initial="locked"
      animate={status}
    >
      <motion.div 
        className={`relative flex items-center justify-center rounded-full w-16 h-16 sm:w-20 sm:h-20 ${getNodeClasses()}`}
        variants={variants}
      >
        {getIcon()}
        {status === 'completed' && (
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-xs font-bold text-yellow-900">✓</span>
          </motion.div>
        )}
      </motion.div>
      
      <div className="text-center max-w-[80px]">
        <motion.span 
          className="text-xs sm:text-sm font-medium text-gray-800 block"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.span>
        <motion.span 
          className="text-xs text-gray-500 block mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {description}
        </motion.span>
      </div>
    </motion.button>
  )
} 