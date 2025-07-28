import { motion, useAnimationControls, AnimatePresence } from 'framer-motion'
import { Check, Star } from 'lucide-react'
import { useState } from 'react'

interface Mission {
  id: string
  title: string
  description: string
  xp: number
  completed: boolean
}

interface MissionCardMotionProps {
  mission: Mission
  onComplete: (missionId: string) => void
}

export default function MissionCardMotion({ mission, onComplete }: MissionCardMotionProps) {
  const [isCompleted, setIsCompleted] = useState(mission.completed)
  const controls = useAnimationControls()

  const handleTap = async () => {
    if (isCompleted) return

    // タップアニメーション
    await controls.start({
      scale: [1, 1.1, 1],
      backgroundColor: ['#FFFDF8', '#E6FCD9', '#FFFDF8'],
      transition: { duration: 0.3 }
    })

    // 完了状態に変更
    setIsCompleted(true)
    onComplete(mission.id)

    // XP獲得アニメーション
    controls.start({
      y: [-20, -40],
      opacity: [1, 0],
      transition: { duration: 0.8 }
    })
  }

  return (
    <motion.div
      className={`relative p-4 rounded-xl border-2 cursor-pointer ${
        isCompleted 
          ? 'bg-green-50 border-green-200' 
          : 'bg-white border-gray-200 hover:border-green-300'
      }`}
      whileHover={!isCompleted ? { scale: 1.02 } : {}}
      whileTap={!isCompleted ? { scale: 0.98 } : {}}
      onClick={handleTap}
      animate={controls}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`font-semibold text-sm ${
            isCompleted ? 'text-green-700' : 'text-gray-800'
          }`}>
            {mission.title}
          </h3>
          <p className={`text-xs mt-1 ${
            isCompleted ? 'text-green-600' : 'text-gray-600'
          }`}>
            {mission.description}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <Check className="w-5 h-5 text-green-600" />
            </motion.div>
          ) : (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-medium text-gray-600">+{mission.xp}</span>
            </div>
          )}
        </div>
      </div>

      {/* XP獲得アニメーション */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            className="absolute top-0 right-0 text-green-600 font-bold text-sm"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
          >
            +{mission.xp} XP
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 