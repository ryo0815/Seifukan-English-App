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

const missions = [
  {
    id: 'mission-1',
    title: '英語が必要なバイトにチャレンジする',
    description: '実践的な英語力を身につけよう',
    xp: 20,
    completed: false
  },
  {
    id: 'mission-2',
    title: '英語で30秒間、切れ目なく自己紹介',
    description: '流暢な英語を目指そう',
    xp: 30,
    completed: false
  },
  {
    id: 'mission-3',
    title: '英語アプリで7日間連続学習',
    description: '継続は力なり',
    xp: 25,
    completed: false
  },
  {
    id: 'mission-4',
    title: '外国人観光客に話しかけてみる',
    description: '実践的な会話力を試そう',
    xp: 40,
    completed: false
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
      {/* Hero Section */}
      <motion.div 
        className="bg-gradient-to-br from-green-400 to-green-600 p-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="text-3xl font-bold text-white mb-2"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          {copy.heroTitle}
        </motion.h1>
        <motion.p 
          className="text-green-100 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {copy.heroSubtitle}
        </motion.p>
      </motion.div>

      {/* Stage Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-6"
      >
        <motion.h2 
          className="text-2xl font-semibold text-center text-gray-800 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          学習ステージ
        </motion.h2>
        <StageGridMotion />
      </motion.div>

      {/* Mission Section */}
      <motion.div 
        className="px-6 pb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {copy.missionTitle}
          </h2>
          <p className="text-gray-600 text-sm">
            {copy.missionSubtitle}
          </p>
        </motion.div>

        <motion.div 
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {missions.map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
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
      </motion.div>
    </div>
  )
}
