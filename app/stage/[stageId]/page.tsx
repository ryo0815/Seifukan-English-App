"use client"

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { getStageById } from "@/lib/phrases"
import { copy } from "@/lib/copywriting"
import { 
  ArrowLeft, 
  Shield, 
  Sword, 
  Star,
  Play,
  CheckCircle,
  Lock,
  ChevronRight
} from "lucide-react"

export default function StagePage() {
  const router = useRouter()
  const params = useParams()
  const stageId = params.stageId as string
  
  const stage = getStageById(stageId)
  
  if (!stage) {
    return <div>ステージが見つかりません</div>
  }

  const stageIcons = {
    'stage-0': Shield,
    'stage-1': Sword,
    'stage-2': Star
  }

  const IconComponent = stageIcons[stageId as keyof typeof stageIcons]

  const handleSubStageClick = (subStageId: string) => {
    router.push(`/stage/${stageId}/${subStageId}`)
  }

  const handleBack = () => {
    router.push('/')
  }

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

  return (
    <div className="min-h-screen bg-soft-yellow">
      {/* Header */}
      <motion.header 
        className="p-6 flex items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Button 
          onClick={handleBack}
          variant="ghost" 
          size="sm"
          className="text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
      </motion.header>

      {/* Stage Header */}
      <motion.div 
        className="px-6 mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <Card className="p-6 bg-gradient-to-br from-green-400 to-green-600 border-0 shadow-lg">
          <div className="text-center text-white">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <IconComponent className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">{stage.title}</h1>
            <p className="text-white/90">{stage.description}</p>
          </div>
        </Card>
      </motion.div>

      {/* Sub-stages List */}
      <motion.div 
        className="px-6 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 
          className="text-2xl font-semibold text-gray-800 mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          学習エリア
        </motion.h2>
        
        <div className="space-y-4">
          {stage.subStages.map((subStage, index) => {
            const isLocked = index > 0 // 最初のサブステージ以外はロック
            const isCompleted = false // 後で進捗管理を実装
            
            return (
              <motion.div
                key={subStage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card
                  className={`p-6 bg-white border-2 hover:shadow-lg transition-all duration-300 ${
                    isLocked 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-green-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isLocked 
                            ? 'bg-gray-300 text-gray-500' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : isLocked ? (
                            <Lock className="w-5 h-5" />
                          ) : (
                            <span className="font-bold text-sm">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${
                            isLocked ? 'text-gray-500' : 'text-gray-800'
                          }`}>
                            {subStage.title}
                          </h3>
                          <p className={`text-sm ${
                            isLocked ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {subStage.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-14">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          isLocked 
                            ? 'bg-gray-100 text-gray-500' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {subStage.phrases.length}個のフレーズ
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleSubStageClick(subStage.id)}
                      disabled={isLocked}
                      variant={isLocked ? "ghost" : "default"}
                      size="sm"
                      className={`${
                        isLocked 
                          ? 'text-gray-400' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {isLocked ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          開始
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
} 