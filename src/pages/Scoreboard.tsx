import WellnessScoreboard from '@/components/wellness/WellnessScoreboard';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';

const Scoreboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Wellness Scoreboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how you rank among fellow international students in wellness activities and arcade games.
          </p>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-4">Compete for Wellness Coins</h2>
            <p className="text-muted-foreground mb-6">
              Play arcade games, complete wellness activities, and climb the leaderboard. 
              Earn coins by completing games under 5 minutes!
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-700 dark:text-yellow-300">1st Place</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Medal className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">2nd Place</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <Award className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-700 dark:text-amber-300">3rd Place</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scoreboard */}
        <WellnessScoreboard />

        {/* How to Earn Coins */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              How to Earn Wellness Coins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">🎯 Arcade Games</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complete any game under 5 minutes = Coins awarded</li>
                  <li>• Faster completion = More coins</li>
                  <li>• Build winning streaks for bonus rewards</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">🧘 Wellness Activities</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complete Focus Quest sessions</li>
                  <li>• Participate in wellness challenges</li>
                  <li>• Maintain daily activity streaks</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Scoreboard;