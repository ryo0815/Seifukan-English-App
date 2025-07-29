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
  ChevronRight,
  BookOpen,
  Target,
  Users,
  Clock,
  Trophy,
  Flag
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

  const stageColors = {
    'stage-0': 'from-blue-500 to-cyan-500',
    'stage-1': 'from-orange-500 to-red-500',
    'stage-2': 'from-purple-500 to-pink-500'
  }

  const stageDescriptions = {
    'stage-0': '基礎的な英語表現を学び、自信をつけましょう',
    'stage-1': '実践的な会話力を身につけ、コミュニケーションを向上させましょう',
    'stage-2': '高度な表現を習得し、ネイティブレベルの英語を目指しましょう'
  }

  const stageTitles = {
    'stage-0': '🌱 基礎の森',
    'stage-1': '🏔️ 実践の山',
    'stage-2': '⭐ 上級の空'
  }

  const IconComponent = stageIcons[stageId as keyof typeof stageIcons]
  const stageColor = stageColors[stageId as keyof typeof stageColors]
  const stageTitle = stageTitles[stageId as keyof typeof stageTitles]

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
      {/* Enhanced Header with Stage-specific Background */}
      <motion.header 
        className={`relative overflow-hidden bg-gradient-to-r ${stageColor} p-6`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <Button 
            onClick={handleBack}
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{stageTitle}</h1>
                <p className="text-white/90 text-sm">{stage.title}</p>
              </div>
            </div>
            <p className="text-white/90 text-sm">
              {stageDescriptions[stageId as keyof typeof stageDescriptions]}
            </p>
          </div>
          
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </motion.header>

      {/* Progress Overview */}
      <motion.div 
        className="px-6 py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 bg-white border-2 border-green-200 shadow-lg">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stage.subStages.length}
              </div>
              <div className="text-sm text-gray-600">エリア</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stage.subStages.reduce((total, subStage) => total + subStage.phrases.length, 0)}
              </div>
              <div className="text-sm text-gray-600">フレーズ</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {Math.round(stage.subStages.reduce((total, subStage) => total + subStage.phrases.length, 0) * 0.3)}
              </div>
              <div className="text-sm text-gray-600">分</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Enhanced Sub-stages List */}
      <motion.div 
        className="px-6 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Flag className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">学習エリア</h2>
            <Flag className="w-6 h-6 text-green-600 ml-2" />
          </div>
          <p className="text-gray-600">段階的に学習を進めましょう</p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto space-y-6">
          {stage.subStages.map((subStage, index) => {
            const isLocked = index > 0 // 最初のサブステージ以外はロック
            const isCompleted = false // 後で進捗管理を実装
            
            const subStageIcons = [Target, Users, Clock, Trophy]
            const SubStageIcon = subStageIcons[index % subStageIcons.length]
            
            return (
              <motion.div
                key={subStage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card
                  className={`p-6 bg-white border-2 hover:shadow-xl transition-all duration-300 ${
                    isLocked 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-green-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    {/* Icon and Status */}
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isLocked 
                          ? 'bg-gray-300 text-gray-500' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : isLocked ? (
                          <Lock className="w-8 h-8" />
                        ) : (
                          <SubStageIcon className="w-8 h-8" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`text-xl font-bold ${
                          isLocked ? 'text-gray-500' : 'text-gray-800'
                        }`}>
                          {subStage.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            isLocked 
                              ? 'bg-gray-100 text-gray-500' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {subStage.phrases.length}個のフレーズ
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-4 ${
                        isLocked ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {subStage.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isLocked ? 'bg-gray-300' : 'bg-green-500'
                          }`}
                          style={{ width: isCompleted ? '100%' : '0%' }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => handleSubStageClick(subStage.id)}
                        disabled={isLocked}
                        variant={isLocked ? "ghost" : "default"}
                        size="lg"
                        className={`${
                          isLocked 
                            ? 'text-gray-400' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {isLocked ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            開始
                          </>
                        )}
                      </Button>
                    </div>
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