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
      className="grid grid-cols-3 gap-6 px-6 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stages.map((stage, index) => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <StageNodeMotion
            id={stage.id}
            title={stage.title}
            description={stage.description}
            status={getStageStatus(stage.id, index)}
            onClick={() => router.push(`/stage/${stage.id}`)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
} 