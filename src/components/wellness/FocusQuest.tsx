import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Trophy, Coins } from "lucide-react";
import confetti from 'canvas-confetti';

interface FocusQuestProps {
  onCoinsEarned: (coins: number) => void;
  onStreakUpdate: (streak: number) => void;
}

const FocusQuest = ({ onCoinsEarned, onStreakUpdate }: FocusQuestProps) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [sessionsCompleted, setSessions] = useState(0);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState(60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const wellnessTips = [
    "Take a sip of water to stay hydrated",
    "Stretch your shoulders and neck",
    "Take three deep breaths",
    "Look away from your screen for 20 seconds",
    "Do a quick posture check",
    "Smile - it releases endorphins!",
    "Wiggle your fingers and toes",
    "Take a moment to appreciate something around you"
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            handleSessionComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  // Rotate tips every 2 minutes
  useEffect(() => {
    if (isActive) {
      const tipInterval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % wellnessTips.length);
      }, 120000);
      return () => clearInterval(tipInterval);
    }
  }, [isActive]);

  const handleSessionComplete = () => {
    // Completion animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const newSessions = sessionsCompleted + 1;
    setSessions(newSessions);
    onCoinsEarned(1);

    // Check for breathing exercise unlock
    if (newSessions === 4) {
      setShowBreathing(true);
    }
  };

  const startBreathingExercise = () => {
    setBreathingTimer(60);
    const breathInterval = setInterval(() => {
      setBreathingPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
    }, 4000); // 4 seconds inhale, 4 seconds exhale

    const countInterval = setInterval(() => {
      setBreathingTimer(prev => {
        if (prev <= 1) {
          clearInterval(breathInterval);
          clearInterval(countInterval);
          setShowBreathing(false);
          onCoinsEarned(2); // Bonus coins for breathing exercise
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#3b82f6', '#a855f7']
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    setCurrentTip(0);
  };

  if (showBreathing) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Trophy className="h-5 w-5 text-green-500" />
            Breathing Exercise Unlocked!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="relative">
            <div 
              className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg transition-transform duration-4000 ease-in-out ${
                breathingPhase === 'inhale' ? 'scale-110' : 'scale-90'
              }`}
              style={{
                boxShadow: breathingPhase === 'inhale' 
                  ? '0 0 30px rgba(59, 130, 246, 0.5)' 
                  : '0 0 20px rgba(147, 51, 234, 0.3)'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                {breathingPhase === 'inhale' ? 'Inhale' : 'Exhale'}
              </div>
            </div>
          </div>
          
          <div className="text-2xl font-mono">{breathingTimer}s</div>
          <p className="text-muted-foreground">
            {breathingPhase === 'inhale' ? 'Breathe in slowly through your nose' : 'Breathe out gently through your mouth'}
          </p>
          
          {breathingTimer === 60 && (
            <Button onClick={startBreathingExercise} className="w-full">
              Start Breathing Exercise
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center gap-2 justify-center">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Focus Quest
        </CardTitle>
        <div className="text-center space-y-2">
          <Badge variant="secondary">Sessions: {sessionsCompleted}</Badge>
          {sessionsCompleted >= 4 && (
            <Badge className="bg-green-500">Breathing Unlocked!</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold mb-2">
            {formatTime(timeLeft)}
          </div>
          <Progress value={progress} className="w-full h-3" />
        </div>

        {/* Current Wellness Tip */}
        {isActive && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Wellness Tip:</p>
              <p className="font-medium">{wellnessTips[currentTip]}</p>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => setIsActive(!isActive)}
            disabled={timeLeft === 0}
            className="flex items-center gap-2"
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          
          <Button variant="outline" onClick={resetTimer} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Session Complete Message */}
        {timeLeft === 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">+1 Wellness Coin Earned!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Great job completing your focus session!
              </p>
              <Button onClick={resetTimer} className="mt-3 w-full">
                Start New Session
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default FocusQuest;