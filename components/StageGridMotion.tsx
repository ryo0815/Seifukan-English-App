import { motion } from 'framer-motion'
import { stages } from '@/lib/phrases'
import StageNodeMotion from './StageNodeMotion'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StageGridMotionProps {
  onStageChange?: (index: number) => void
  currentStageIndex?: number
}

export default function StageGridMotion({ 
  onStageChange, 
  currentStageIndex: externalCurrentStageIndex 
}: StageGridMotionProps) {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [currentStageIndex, setCurrentStageIndex] = useState(externalCurrentStageIndex || 0)
  const [scrollPosition, setScrollPosition] = useState(0)

  // 外部からcurrentStageIndexが変更された場合の処理
  useEffect(() => {
    if (externalCurrentStageIndex !== undefined) {
      setCurrentStageIndex(externalCurrentStageIndex)
    }
  }, [externalCurrentStageIndex])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'a':
          // 左に移動
          const newLeftIndex = Math.max(0, currentStageIndex - 1)
          setCurrentStageIndex(newLeftIndex)
          onStageChange?.(newLeftIndex)
          break
        case 'd':
          // 右に移動
          const newRightIndex = Math.min(stages.length - 1, currentStageIndex + 1)
          setCurrentStageIndex(newRightIndex)
          onStageChange?.(newRightIndex)
          break
        case 'enter':
        case ' ':
          // 現在のステージを選択
          if (currentStageIndex < stages.length) {
            router.push(`/stage/${stages[currentStageIndex].id}`)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentStageIndex, router, onStageChange])

  // スクロール位置の更新
  useEffect(() => {
    const container = document.getElementById('stage-container')
    if (container) {
      const stageWidth = 200 // 概算のステージ幅
      const newScrollPosition = currentStageIndex * stageWidth
      setScrollPosition(newScrollPosition)
      
      // スムーズスクロール
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      })
    }
  }, [currentStageIndex])

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

  const getProgressStars = (index: number) => {
    // 仮の進捗実装
    if (index === 0) return ['★', '☆', '☆'] // 1/3完了
    if (index === 1) return ['★', '★', '★'] // 3/3完了
    return ['☆', '☆', '☆'] // 未開始
  }

  const getStageBackground = (index: number) => {
    const backgrounds = [
      'from-blue-400 via-blue-500 to-blue-600', // ステージ1: 青
      'from-orange-400 via-orange-500 to-orange-600', // ステージ2: オレンジ
      'from-purple-400 via-purple-500 to-purple-600' // ステージ3: 紫
    ]
    return backgrounds[index] || backgrounds[0]
  }

  const getStageTitle = (index: number) => {
    const titles = [
      '🌱 基礎の森',
      '🏔️ 実践の山',
      '⭐ 上級の空'
    ]
    return titles[index] || 'ステージ'
  }

  return (
    <div className="relative min-h-[400px] overflow-hidden">
      {/* Mario Background */}
      <div 
        className="absolute inset-0 bg-repeat-x bg-bottom"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='mario-ground' patternUnits='userSpaceOnUse' width='200' height='100'%3E%3Crect width='200' height='100' fill='%23fbbf24'/%3E%3Crect y='80' width='200' height='20' fill='%23d97706'/%3E%3Crect y='85' width='200' height='15' fill='%23b45309'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23mario-ground)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 100px'
        }}
      />

      {/* Stage Path Container */}
      <motion.div 
        className="relative px-6 py-8 min-w-[1500px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stage Title */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={`inline-block px-6 py-3 rounded-full bg-gradient-to-r ${getStageBackground(currentStageIndex)} text-white shadow-lg`}>
            <h3 className="text-xl font-bold">{getStageTitle(currentStageIndex)}</h3>
            <p className="text-sm opacity-90">ステージ {currentStageIndex + 1} / {stages.length}</p>
          </div>
        </motion.div>

        {/* Navigation Instructions */}
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">A</kbd>
              <span className="text-sm text-gray-600">左移動</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">D</kbd>
              <span className="text-sm text-gray-600">右移動</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Enter</kbd>
              <span className="text-sm text-gray-600">選択</span>
            </div>
          </div>
        </motion.div>

        {/* Horizontal Stage Path */}
        <div 
          id="stage-container"
          className="flex items-center justify-center space-x-8 overflow-x-auto pb-8 scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {stages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`flex flex-col items-center space-y-4 relative ${
                index === currentStageIndex ? 'ring-4 ring-yellow-400 ring-opacity-50 rounded-full p-2' : ''
              }`}
              style={{
                marginTop: index % 2 === 0 ? '2rem' : '0rem',
                marginBottom: index % 2 === 0 ? '0rem' : '2rem',
                marginLeft: index % 3 === 0 ? '1rem' : '0rem',
                zIndex: stages.length - index
              }}
            >
              {/* Arrow to next stage */}
              {index < stages.length - 1 && (
                <motion.div 
                  className="absolute top-1/2 transform -translate-y-1/2"
                  style={{ left: 'calc(100% + 2rem)' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                >
                  <ChevronRight className="w-8 h-8 text-green-600" />
                </motion.div>
              )}

              {/* Stage Node */}
              <div className="relative">
                <motion.div
                  className="transform"
                  style={{ 
                    rotate: `${(index % 3 - 1) * 3}deg`,
                    transform: `rotate(${(index % 3 - 1) * 3}deg) scale(${isMobile ? 0.9 : 1})`
                  }}
                >
                  <StageNodeMotion
                    id={stage.id}
                    title={stage.title}
                    description={stage.description}
                    status={getStageStatus(stage.id, index)}
                    onClick={() => router.push(`/stage/${stage.id}`)}
                  />
                </motion.div>
              </div>

              {/* Progress Bar */}
              <motion.div 
                className="flex space-x-1 mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 + 0.4 }}
              >
                {getProgressStars(index).map((star, starIndex) => (
                  <span 
                    key={starIndex} 
                    className={`text-lg ${star === '★' ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    {star}
                  </span>
                ))}
              </motion.div>

              {/* Stage Number Badge */}
              <motion.div 
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 + 0.5 }}
              >
                {index + 1}
              </motion.div>

              {/* Current Stage Indicator */}
              {index === currentStageIndex && (
                <motion.div
                  className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  現在選択中
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Ground Path Line */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{ 
            bottom: '2rem',
            left: '10%',
            right: '10%'
          }}
        />
      </motion.div>
    </div>
  )
} 