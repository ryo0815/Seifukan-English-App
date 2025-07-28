"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Mic, 
  MicOff, 
  Play,
  Square,
  Volume2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Bug,
  Info
} from "lucide-react"
import { motion } from 'framer-motion'

interface AzureSpeakingEvaluation {
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'E'
  gradeDescription?: string
  pronunciationScore?: number
  accuracyScore?: number
  fluencyScore?: number
  completenessScore?: number
  recognizedText?: string
  improvements: string[]
  positives: string[]
  feedback: string
  error?: string
  azureData?: any
  isDemo?: boolean
  message?: string
}

interface AISpeakingPracticeProps {
  targetText: string
  targetMeaning: string
  onComplete: (score: number) => void
  onIncorrect?: () => void // 不正解時のコールバック
  onNextQuestion?: () => void // 次の問題に進むコールバック
}

export function AISpeakingPractice({
  targetText,
  targetMeaning,
  onComplete,
  onIncorrect,
  onNextQuestion
}: AISpeakingPracticeProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [evaluation, setEvaluation] = useState<AzureSpeakingEvaluation | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [error, setError] = useState("")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlayingExample, setIsPlayingExample] = useState(false)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [showRetryButton, setShowRetryButton] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  // Reset evaluation results when targetText changes (new question)
  useEffect(() => {
    console.log('Target text changed, resetting evaluation results')
    setEvaluation(null)
    setComparisonData(null)
    setHasRecorded(false)
    setError("")
    setAudioBlob(null)
    setRecordingTime(0)
    setIsPlayingExample(false)
    setShowRetryButton(false)
    setIsEvaluating(false)
    setIsRecording(false)
    
    // Stop any ongoing recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    // Clear any active timers
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
    
    // Stop any ongoing speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [targetText])

  const startRecording = async () => {
    try {
      setError("")
      setEvaluation(null)
      setComparisonData(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        setHasRecorded(true)
        
        console.log('Recording completed, blob size:', audioBlob.size)
        
        // Convert to WAV for Azure Speech Service
        await convertAndEvaluate(audioBlob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Recording error:', error)
      setError('マイクへのアクセスが許可されていません。ブラウザの設定を確認してください。')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }

  const playExampleAudio = () => {
    if (isPlayingExample) return
    
    setIsPlayingExample(true)
    setError("")

    // Use Web Speech API for pronunciation practice
    if ('speechSynthesis' in window && targetText) {
      const utterance = new SpeechSynthesisUtterance(targetText)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      utterance.pitch = 1.0
      utterance.volume = 0.8
      
      utterance.onstart = () => setIsPlayingExample(true)
      utterance.onend = () => setIsPlayingExample(false)
      utterance.onerror = () => {
        setIsPlayingExample(false)
        setError('お手本音声の再生に失敗しました')
      }
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices()
      const englishVoice = voices.find(v => v.lang.startsWith('en-US')) || voices[0]
      if (englishVoice) {
        utterance.voice = englishVoice
      }
      
      window.speechSynthesis.speak(utterance)
    } else {
      setIsPlayingExample(false)
      setError('音声合成がサポートされていません')
    }
  }



  const convertAndEvaluate = async (audioBlob: Blob) => {
    setIsEvaluating(true)
    setError("")
    setShowRetryButton(false)

    try {
      console.log('Converting audio blob to WAV...')
      // Convert webm to wav for Azure Speech Service
      const wavBlob = await convertToWav(audioBlob)
      console.log('WAV conversion completed, size:', wavBlob.size)
      
      console.log('Sending audio to speech evaluation API...')

      // FormDataを使用してAPIに送信
      const formData = new FormData()
      formData.append('audio', wavBlob, 'recording.wav')
      formData.append('referenceText', targetText)
      
      const response = await fetch('/api/speech-evaluation', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Speech evaluation failed:', errorData)
        throw new Error(errorData.error || 'Speech evaluation failed')
      }

      const result = await response.json()
      console.log('Speech evaluation completed:', result)
      
      // 評価結果を設定
      const evaluationResult: AzureSpeakingEvaluation = {
        overallGrade: result.overallGrade,
        pronunciationScore: result.pronunciationScore,
        accuracyScore: result.accuracyScore,
        fluencyScore: result.fluencyScore,
        completenessScore: result.completenessScore,
        recognizedText: result.recognizedText,
        improvements: result.improvements,
        positives: result.positives,
        feedback: result.feedback
      }
      
      setComparisonData(result)
      setEvaluation(evaluationResult)
      
      // B以上の場合のみ合格として onComplete を呼び出す
      if (['A', 'B'].includes(result.overallGrade)) {
        const gradeToScore = { A: 95, B: 85, C: 75, D: 65, E: 55 }
        onComplete(gradeToScore[result.overallGrade as keyof typeof gradeToScore] || 55)
      } else {
        // C以下の場合は不正解として処理
        setShowRetryButton(true)
        if (onIncorrect) {
          onIncorrect()
        }
      }
      
    } catch (error) {
      console.error('Evaluation error:', error)
      const errorMessage = error instanceof Error ? error.message : '評価中にエラーが発生しました'
      setError(errorMessage)
    } finally {
      setIsEvaluating(false)
    }
  }

  const convertToWav = async (webmBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        audioContext.decodeAudioData(arrayBuffer).then(audioBuffer => {
          const wavBlob = audioBufferToWav(audioBuffer)
          resolve(wavBlob)
        }).catch(reject)
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(webmBlob)
    })
  }

  const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
    const numChannels = 1 // モノラル
    const sampleRate = 16000 // Azure推奨
    const format = 1 // PCM
    const bitDepth = 16
    
    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    
    // リサンプリング
    const originalData = audioBuffer.getChannelData(0)
    const resampleRatio = audioBuffer.sampleRate / sampleRate
    const newLength = Math.round(originalData.length / resampleRatio)
    const resampledData = new Float32Array(newLength)
    
    for (let i = 0; i < newLength; i++) {
      const originalIndex = Math.round(i * resampleRatio)
      resampledData[i] = originalData[originalIndex] || 0
    }
    
    const buffer = new ArrayBuffer(44 + newLength * bytesPerSample)
    const view = new DataView(buffer)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + newLength * bytesPerSample, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(36, 'data')
    view.setUint32(40, newLength * bytesPerSample, true)
    
    // Convert audio data
    let offset = 44
    for (let i = 0; i < newLength; i++) {
      const sample = Math.max(-1, Math.min(1, resampledData[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }
    
    return new Blob([buffer], { type: 'audio/wav' })
  }

  const playRecording = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob))
      audio.play()
    }
  }

  const reset = () => {
    setEvaluation(null)
    setHasRecorded(false)
    setError("")
    setAudioBlob(null)
    setRecordingTime(0)
    setComparisonData(null)
    setIsPlayingExample(false)
    setShowRetryButton(false)
  }

  const handleNextQuestion = () => {
    if (onIncorrect) {
      onIncorrect()
    }
    if (onNextQuestion) {
      onNextQuestion()
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100 border-green-300'
      case 'B': return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'C': return 'text-yellow-600 bg-yellow-100 border-yellow-300'
      case 'D': return 'text-orange-600 bg-orange-100 border-orange-300'
      case 'E': return 'text-red-600 bg-red-100 border-red-300'
      default: return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Recording Controls */}
      <div className="text-center space-y-6">
        {/* Enhanced Example Audio Button */}
        <div className="flex justify-center">
          <Button
            onClick={playExampleAudio}
            disabled={isPlayingExample}
            variant="outline"
            size="lg"
            className="border-green-300 text-green-600 hover:bg-green-50 px-8"
          >
            <Volume2 className="w-5 h-5 mr-3" />
            {isPlayingExample ? 'お手本を再生中...' : 'お手本を聞く'}
          </Button>
        </div>

        {!hasRecorded ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  size="lg"
                  className={`${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } rounded-full w-24 h-24 shadow-xl`}
                >
                  {isRecording ? <Square className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
                </Button>
              </motion.div>
            </div>

            {isRecording && (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-red-600 font-medium text-lg">録音中...</div>
                <div className="text-2xl font-bold text-gray-800">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </div>
              </motion.div>
            )}
            
            <p className="text-gray-600 text-lg">
              マイクボタンを押して録音開始
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center space-x-6">
              <Button
                onClick={playRecording}
                variant="outline"
                size="lg"
                className="border-green-300 text-green-600 hover:bg-green-50 px-8"
              >
                <Play className="w-6 h-6 mr-3" />
                再生
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                size="lg"
                className="border-gray-300 text-gray-600 hover:bg-gray-50 px-8"
              >
                <MicOff className="w-6 h-6 mr-3" />
                録音し直し
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Evaluation Loading */}
      {isEvaluating && (
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">
              お手本と比較評価中...
            </span>
          </div>
          <p className="text-sm text-gray-600">
            少々お待ちください
          </p>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-medium">エラー</span>
          </div>
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}



      {/* Enhanced Speech Evaluation Results */}
      {comparisonData && (
        <Card className="p-8 border-2 border-green-200 bg-white shadow-xl">
          <div className="space-y-6">
            {/* Enhanced Evaluation Header */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                発音評価結果
              </h3>
              <div className="text-7xl font-bold text-green-600 mb-4">
                {comparisonData.overallGrade}
              </div>
              <Badge className={`${getGradeColor(comparisonData.overallGrade)} text-xl px-6 py-3 border-2`}>
                {comparisonData.overallGrade}級
              </Badge>
              <p className="text-sm text-gray-600 mt-3">
                5段階評価
              </p>
              
              {/* Enhanced 合格・不合格の判定を表示 */}
              <div className="mt-6">
                {['A', 'B'].includes(comparisonData.overallGrade) ? (
                  <div className="flex items-center justify-center space-x-3 text-green-600">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-bold text-lg">合格！次の問題に進みます</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3 text-red-600">
                    <XCircle className="w-6 h-6" />
                    <span className="font-bold text-lg">不正解です（B以上で合格）</span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Detailed Scores */}
            {(comparisonData.pronunciationScore || comparisonData.accuracyScore || comparisonData.fluencyScore || comparisonData.completenessScore) && (
              <div className="grid grid-cols-2 gap-6">
                {comparisonData.pronunciationScore && (
                  <div className="bg-gray-50 p-6 rounded-xl border-2 border-green-200 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{comparisonData.pronunciationScore}</div>
                    <div className="text-sm text-gray-700 font-medium">発音</div>
                  </div>
                )}
                {comparisonData.accuracyScore && (
                  <div className="bg-gray-50 p-6 rounded-xl border-2 border-green-200 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{comparisonData.accuracyScore}</div>
                    <div className="text-sm text-gray-700 font-medium">正確性</div>
                  </div>
                )}
                {comparisonData.fluencyScore && (
                  <div className="bg-gray-50 p-6 rounded-xl border-2 border-green-200 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{comparisonData.fluencyScore}</div>
                    <div className="text-sm text-gray-700 font-medium">流暢性</div>
                  </div>
                )}
                {comparisonData.completenessScore && (
                  <div className="bg-gray-50 p-6 rounded-xl border-2 border-green-200 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{comparisonData.completenessScore}</div>
                    <div className="text-sm text-gray-700 font-medium">完全性</div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Recognized Text */}
            {comparisonData.recognizedText && (
              <div className="bg-gray-50 p-6 rounded-xl border-2 border-green-200">
                <div className="text-sm font-bold text-gray-700 mb-3">認識されたテキスト:</div>
                <div className="text-lg text-gray-800 italic bg-white p-4 rounded-lg border">
                  "{comparisonData.recognizedText}"
                </div>
              </div>
            )}

            {/* Enhanced Evaluation Feedback */}
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-green-200">
              <div className="text-lg text-gray-800 leading-relaxed">
                {comparisonData.feedback}
              </div>
            </div>

            {/* Enhanced Positive Points */}
            {comparisonData.positives && comparisonData.positives.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-700 text-lg">良かった点</span>
                </div>
                <ul className="text-green-700 space-y-2">
                  {comparisonData.positives.map((positive: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-lg">{positive}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Enhanced Improvements */}
            {comparisonData.improvements && comparisonData.improvements.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-orange-700 text-lg">改善点</span>
                </div>
                <ul className="text-orange-700 space-y-2">
                  {comparisonData.improvements.map((improvement: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-orange-600 font-bold">•</span>
                      <span className="text-lg">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Enhanced 改善ポイントブロック */}
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-4 text-center">
                改善ポイント
              </h3>
              <div className="space-y-4">
                {/* 発音に沿ったアドバイス（3つ） */}
                {comparisonData.improvements && comparisonData.improvements.length > 0 ? (
                  comparisonData.improvements.slice(0, 3).map((improvement: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">
                        {index + 1}
                      </div>
                      <p className="text-blue-800 font-medium leading-relaxed text-lg">
                        {improvement}
                      </p>
                    </div>
                  ))
                ) : (
                  // フォールバック用のデフォルト改善ポイント
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">1</div>
                      <p className="text-blue-800 font-medium text-lg">お手本音声をもう一度聞いてみましょう</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">2</div>
                      <p className="text-blue-800 font-medium text-lg">一つ一つの音を意識して発音してみましょう</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">3</div>
                      <p className="text-blue-800 font-medium text-lg">口の形と舌の位置に注意してみましょう</p>
                    </div>
                  </>
                )}
                
                {/* カタカナ発音の度合いに応じたアドバイス（2つ） */}
                {comparisonData.detailedAnalysis && (
                  <>
                    {comparisonData.detailedAnalysis.katakanaDetection?.detected && !['A'].includes(comparisonData.overallGrade) ? (
                      // カタカナ発音が検出された場合
                      <>
                        <div className="flex items-start space-x-3">
                          <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">4</div>
                          <p className="text-red-800 font-medium text-lg">
                            {comparisonData.detailedAnalysis.katakanaDetection.confidence > 0.7 
                              ? 'カタカナ発音が強く検出されています。ネイティブ発音を意識して練習してください'
                              : 'カタカナ発音が検出されています。英語の音素を正確に発音するよう心がけてください'
                            }
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">5</div>
                          <p className="text-red-800 font-medium text-lg">
                            {comparisonData.detailedAnalysis.katakanaDetection.confidence > 0.7
                              ? 'リズムとイントネーションを自然にし、英語らしい発音を目指してください'
                              : 'お手本音声のリズムとイントネーションを参考に練習してください'
                            }
                          </p>
                        </div>
                      </>
                    ) : (
                      // カタカナ発音が検出されない場合の追加アドバイス（2つ）
                      <>
                        <div className="flex items-start space-x-3">
                          <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">4</div>
                          <p className="text-green-800 font-medium text-lg">
                            リズムとイントネーションを自然にしてください
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">5</div>
                          <p className="text-green-800 font-medium text-lg">
                            良い発音です。さらに練習しましょう
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            {showRetryButton && (
              <div className="flex justify-center space-x-6 mt-8">
                <Button
                  onClick={reset}
                  variant="outline"
                  size="lg"
                  className="flex items-center space-x-3 border-gray-300 text-gray-600 hover:bg-gray-50 px-8"
                >
                  <MicOff className="w-5 h-5" />
                  <span className="text-lg">もう一度録音</span>
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  size="lg"
                  className="flex items-center space-x-3 bg-green-500 hover:bg-green-600 text-white px-8"
                >
                  <span className="text-lg">次の問題に進む</span>
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
} 