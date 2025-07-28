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
      {/* Recording Controls */}
      <div className="text-center space-y-4">
        {/* Example Audio Button */}
        <div className="flex justify-center">
          <Button
            onClick={playExampleAudio}
            disabled={isPlayingExample}
            variant="outline"
            size="sm"
            className="border-green-300 text-green-600 hover:bg-green-50"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            {isPlayingExample ? 'お手本を再生中...' : 'お手本を聞く'}
          </Button>
        </div>

        {!hasRecorded ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                size="lg"
                className={`${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } rounded-full w-20 h-20 shadow-lg`}
              >
                {isRecording ? <Square className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </Button>
            </div>

            {isRecording && (
              <div className="space-y-2">
                <div className="text-red-600 font-medium">録音中...</div>
                <div className="text-sm text-gray-600">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-600">
              マイクボタンを押して録音開始
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <Button
                onClick={playRecording}
                variant="outline"
                size="lg"
                className="border-green-300 text-green-600 hover:bg-green-50"
              >
                <Play className="w-5 h-5 mr-2" />
                再生
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                size="lg"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <MicOff className="w-5 h-5 mr-2" />
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



      {/* Speech Evaluation Results */}
      {comparisonData && (
        <Card className="p-6 border-2 border-green-200 bg-white shadow-lg">
          <div className="space-y-4">
            {/* Evaluation Header */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                発音評価結果
              </h3>
              <div className="text-6xl font-bold text-green-600 mb-2">
                {comparisonData.overallGrade}
              </div>
              <Badge className={`${getGradeColor(comparisonData.overallGrade)} text-lg px-4 py-2 border-2`}>
                {comparisonData.overallGrade}級
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                5段階評価
              </p>
              
              {/* 合格・不合格の判定を表示 */}
              <div className="mt-4">
                {['A', 'B'].includes(comparisonData.overallGrade) ? (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">合格！次の問題に進みます</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">不正解です（B以上で合格）</span>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Scores */}
            {(comparisonData.pronunciationScore || comparisonData.accuracyScore || comparisonData.fluencyScore || comparisonData.completenessScore) && (
              <div className="grid grid-cols-2 gap-4">
                {comparisonData.pronunciationScore && (
                  <div className="bg-gray-50 p-3 rounded-lg border-2 border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-600">{comparisonData.pronunciationScore}</div>
                    <div className="text-xs text-gray-700">発音</div>
                  </div>
                )}
                {comparisonData.accuracyScore && (
                  <div className="bg-gray-50 p-3 rounded-lg border-2 border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-600">{comparisonData.accuracyScore}</div>
                    <div className="text-xs text-gray-700">正確性</div>
                  </div>
                )}
                {comparisonData.fluencyScore && (
                  <div className="bg-gray-50 p-3 rounded-lg border-2 border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-600">{comparisonData.fluencyScore}</div>
                    <div className="text-xs text-gray-700">流暢性</div>
                  </div>
                )}
                {comparisonData.completenessScore && (
                  <div className="bg-gray-50 p-3 rounded-lg border-2 border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-600">{comparisonData.completenessScore}</div>
                    <div className="text-xs text-gray-700">完全性</div>
                  </div>
                )}
              </div>
            )}

            {/* Recognized Text */}
            {comparisonData.recognizedText && (
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-green-200">
                <div className="text-sm font-medium text-gray-700 mb-1">認識されたテキスト:</div>
                <div className="text-sm text-gray-800 italic">"{comparisonData.recognizedText}"</div>
              </div>
            )}

            {/* Evaluation Feedback */}
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-green-200">
              <div className="text-sm text-gray-800">
                {comparisonData.feedback}
              </div>
            </div>

            {/* Positive Points */}
            {comparisonData.positives && comparisonData.positives.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-700">良かった点</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  {comparisonData.positives.map((positive: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span>✓</span>
                      <span>{positive}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {comparisonData.improvements && comparisonData.improvements.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-700">改善点</span>
                </div>
                <ul className="text-sm text-orange-700 space-y-1">
                  {comparisonData.improvements.map((improvement: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span>•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Action Buttons */}
            {showRetryButton && (
              <div className="flex justify-center space-x-4 mt-4">
                <Button
                  onClick={reset}
                  variant="outline"
                  className="flex items-center space-x-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <MicOff className="w-4 h-4" />
                  <span>もう一度録音</span>
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white"
                >
                  <span>次の問題に進む</span>
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
} 