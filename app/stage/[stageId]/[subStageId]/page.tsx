"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { getSubStageById } from "@/lib/phrases"
import { AISpeakingPractice } from "@/components/ui/ai-speaking-practice"
import { copy } from "@/lib/copywriting"
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  Home,
  Star,
  Trophy,
  BookOpen,
  Target,
  Clock,
  Users,
  Mic,
  Play,
  Pause
} from "lucide-react"

export default function SubStagePage() {
  const router = useRouter()
  const params = useParams()
  const stageId = params.stageId as string
  const subStageId = params.subStageId as string
  
  const subStage = getSubStageById(stageId, subStageId)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [completedPhrases, setCompletedPhrases] = useState<Set<number>>(new Set())
  
  if (!subStage) {
    return <div>サブステージが見つかりません</div>
  }

  const currentPhrase = subStage.phrases[currentPhraseIndex]
  const progress = (completedPhrases.size / subStage.phrases.length) * 100
  const isCompleted = completedPhrases.size === subStage.phrases.length

  const handleBack = () => {
    router.push(`/stage/${stageId}`)
  }

  const handleHome = () => {
    router.push('/')
  }

  const handlePhraseComplete = () => {
    const newCompleted = new Set(completedPhrases)
    newCompleted.add(currentPhraseIndex)
    setCompletedPhrases(newCompleted)
  }

  const handleNextPhrase = () => {
    if (currentPhraseIndex < subStage.phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1)
    }
  }

  const handlePrevPhrase = () => {
    if (currentPhraseIndex > 0) {
      setCurrentPhraseIndex(currentPhraseIndex - 1)
    }
  }

  const handlePhraseSelect = (index: number) => {
    setCurrentPhraseIndex(index)
  }

  return (
    <div className="min-h-screen bg-soft-yellow">
      {/* Enhanced Header */}
      <motion.header 
        className="relative overflow-hidden bg-gradient-to-r from-green-400 to-green-600 p-6"
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
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">{subStage.title}</h1>
            </div>
            <p className="text-white/90 text-sm">
              {subStage.description}
            </p>
          </div>
          
          <Button 
            onClick={handleHome}
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <Home className="w-4 h-4" />
          </Button>
        </div>
      </motion.header>

      {/* Enhanced Progress Section */}
      <motion.div 
        className="px-6 py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 bg-white border-2 border-green-200 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{subStage.title}</h2>
                  <p className="text-sm text-gray-600">学習進捗</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {completedPhrases.size}/{subStage.phrases.length}
                </div>
                <div className="text-sm text-gray-600">フレーズ完了</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>進捗</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-3 bg-gray-200" 
                style={{
                  '--progress-color': '#58CC02'
                } as React.CSSProperties}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Enhanced Phrase Navigation */}
      <motion.div 
        className="px-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 bg-white border-2 border-green-200 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-800">フレーズ選択</h3>
              <Star className="w-5 h-5 text-green-600" />
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              {subStage.phrases.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => handlePhraseSelect(index)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    index === currentPhraseIndex
                      ? 'bg-green-500 text-white shadow-lg scale-110'
                      : completedPhrases.has(index)
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {completedPhrases.has(index) ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    index + 1
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Enhanced Main Content */}
      <motion.div 
        className="px-6 pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <AnimatePresence mode="wait">
          {isCompleted ? (
            /* Enhanced Completion Screen */
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring' }}
            >
              <Card className="p-8 bg-gradient-to-br from-green-400 to-green-600 border-0 text-center shadow-xl">
                <div className="space-y-6">
                  <motion.div 
                    className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <Trophy className="w-12 h-12 text-white" />
                  </motion.div>
                  
                  <motion.h2 
                    className="text-3xl font-bold text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    おめでとうございます！
                  </motion.h2>
                  
                  <motion.p 
                    className="text-white/90 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    「{subStage.title}」をクリアしました！
                  </motion.p>
                  
                  <motion.div 
                    className="flex justify-center space-x-4 mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Button
                      onClick={handleBack}
                      variant="secondary"
                      className="bg-white text-green-600 hover:bg-gray-100 font-semibold"
                    >
                      ステージに戻る
                    </Button>
                    <Button
                      onClick={handleHome}
                      variant="secondary"
                      className="bg-white text-green-600 hover:bg-gray-100 font-semibold"
                    >
                      ホームに戻る
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ) : (
            /* Enhanced Practice Screen */
            <motion.div
              key="practice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Enhanced Current Phrase Info */}
              <Card className="p-6 bg-white border-2 border-green-200 shadow-lg">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Mic className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600 text-sm font-medium">
                      フレーズ {currentPhraseIndex + 1} / {subStage.phrases.length}
                    </span>
                    <Mic className="w-5 h-5 text-green-600" />
                  </div>
                  
                  {completedPhrases.has(currentPhraseIndex) && (
                    <motion.div 
                      className="flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-green-600 text-sm font-medium">クリア済み</span>
                    </motion.div>
                  )}
                </div>
              </Card>

              {/* Enhanced Phrase Display */}
              <Card className="p-8 bg-white border-2 border-green-200 shadow-lg">
                <div className="text-center space-y-6">
                  <motion.h2 
                    className="text-3xl font-bold text-gray-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {currentPhrase.text}
                  </motion.h2>
                  
                  <motion.div
                    className="flex items-center justify-center space-x-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-center">
                      <div className="text-lg font-medium text-blue-600 mb-1">発音記号</div>
                      <p className="text-xl text-blue-600">{currentPhrase.phonetic}</p>
                    </div>
                    
                    <div className="w-px h-12 bg-gray-300"></div>
                    
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-600 mb-1">意味</div>
                      <p className="text-xl text-gray-600">{currentPhrase.katakana}</p>
                    </div>
                  </motion.div>
                </div>
              </Card>

              {/* Enhanced Pronunciation Practice */}
              <Card className="p-6 bg-white border-2 border-green-200 shadow-lg">
                <AISpeakingPractice
                  targetText={currentPhrase.text}
                  targetMeaning={currentPhrase.katakana}
                  onComplete={(score) => {
                    console.log('Phrase completed with score:', score)
                    handlePhraseComplete()
                  }}
                  onIncorrect={() => {
                    console.log('Pronunciation incorrect, allowing retry')
                  }}
                  onNextQuestion={() => {
                    if (currentPhraseIndex < subStage.phrases.length - 1) {
                      handleNextPhrase()
                    }
                  }}
                />
              </Card>

              {/* Enhanced Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  onClick={handlePrevPhrase}
                  disabled={currentPhraseIndex === 0}
                  variant="outline"
                  size="lg"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  前へ
                </Button>

                <Button
                  onClick={handleNextPhrase}
                  disabled={currentPhraseIndex === subStage.phrases.length - 1}
                  variant="outline"
                  size="lg"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  次へ
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
} 