import { motion } from 'framer-motion'
import { stages } from '@/lib/phrases'
import StageNodeMotion from './StageNodeMotion'
import { useRouter } from 'next/navigation'

export default function StageGridMotion() {
  const router = useRouter()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const getStageStatus = (stageId: string, index: number) => {
    // 仮の実装：最初のステージはアクティブ、他はロック
    if (index === 0) return 'active'
    if (index === 1) return 'completed'
    return 'locked'
  }

  return (
    <motion.div 
      className="flex flex-col space-y-6 px-6 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stages.map((stage, index) => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-4"
        >
          {/* Stage Number */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-gray-600">{index + 1}</span>
            </div>
          </div>

          {/* Stage Content */}
          <div className="flex-1">
            <StageNodeMotion
              id={stage.id}
              title={stage.title}
              description={stage.description}
              status={getStageStatus(stage.id, index)}
              onClick={() => router.push(`/stage/${stage.id}`)}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
} 