"use client"

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { stages } from "@/lib/phrases"
import { copy } from "@/lib/copywriting"
import StageGridMotion from "@/components/StageGridMotion"
import MissionCardMotion from "@/components/MissionCardMotion"
import { useState } from 'react'
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Star,
  Play,
  ArrowRight,
  Users,
  Clock
} from 'lucide-react'

const missions = [
  {
    id: 'mission-1',
    title: '英語が必要なバイトにチャレンジする',
    description: '実践的な英語力を身につけよう',
    xp: 20,
    completed: false,
    icon: Users
  },
  {
    id: 'mission-2',
    title: '英語で30秒間、切れ目なく自己紹介',
    description: '流暢な英語を目指そう',
    xp: 30,
    completed: false,
    icon: Target
  },
  {
    id: 'mission-3',
    title: '英語アプリで7日間連続学習',
    description: '継続は力なり',
    xp: 25,
    completed: false,
    icon: Clock
  },
  {
    id: 'mission-4',
    title: '外国人観光客に話しかけてみる',
    description: '実践的な会話力を試そう',
    xp: 40,
    completed: false,
    icon: Trophy
  }
]

export default function Home() {
  const router = useRouter()
  const [completedMissions, setCompletedMissions] = useState<string[]>([])

  const handleMissionComplete = (missionId: string) => {
    setCompletedMissions(prev => [...prev, missionId])
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
      {/* Enhanced Hero Section */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-green-400 via-green-500 to-green-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-20 right-0 w-24 h-24 bg-white rounded-full translate-x-12"></div>
          <div className="absolute bottom-0 left-1/4 w-16 h-16 bg-white rounded-full translate-y-8"></div>
        </div>

        <div className="relative px-6 py-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl font-bold text-white mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {copy.heroTitle}
          </motion.h1>
          
          <motion.p 
            className="text-green-100 text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {copy.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Button 
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              学習を始める
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        className="px-6 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-sm text-gray-600">ステージ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">レッスン</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">50+</div>
            <div className="text-sm text-gray-600">フレーズ</div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stage Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-6 py-8"
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Star className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">学習ステージ</h2>
            <Star className="w-6 h-6 text-green-600 ml-2" />
          </div>
          <p className="text-gray-600">段階的に英語力を向上させましょう</p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto">
          <StageGridMotion />
        </div>
      </motion.div>

      {/* Enhanced Mission Section */}
      <motion.div 
        className="px-6 pb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">
              {copy.missionTitle}
            </h2>
            <Trophy className="w-6 h-6 text-green-600 ml-2" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {copy.missionSubtitle}
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {missions.map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 + index * 0.1 }}
              >
                <MissionCardMotion
                  mission={{
                    ...mission,
                    completed: completedMissions.includes(mission.id)
                  }}
                  onComplete={handleMissionComplete}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
