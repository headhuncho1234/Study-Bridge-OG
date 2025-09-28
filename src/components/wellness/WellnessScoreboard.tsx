import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';

interface ScoreboardEntry {
  user_id: string;
  display_name: string | null;
  username: string;
  avatar_url: string | null;
  coins: number;
  rank: number;
}

const WellnessScoreboard = () => {
  const [leaderboard, setLeaderboard] = useState<ScoreboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, display_name, username, avatar_url, coins')
          .order('coins', { ascending: false })
          .limit(10);

        if (error) throw error;

        const leaderboardWithRanks = data.map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

        setLeaderboard(leaderboardWithRanks);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Wellness Scoreboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="w-24 h-4 bg-muted rounded mb-1"></div>
                  <div className="w-16 h-3 bg-muted rounded"></div>
                </div>
                <div className="w-12 h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Wellness Scoreboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.map((entry) => (
            <div
              key={entry.user_id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                entry.rank <= 3 ? 'bg-gradient-to-r from-primary/5 to-transparent border border-primary/20' : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(entry.rank)}
              </div>
              
              <Avatar className="w-10 h-10">
                <AvatarImage src={entry.avatar_url || undefined} />
                <AvatarFallback>
                  {(entry.display_name || entry.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {entry.display_name || entry.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{entry.username}
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-primary">{entry.coins}</p>
                <p className="text-xs text-muted-foreground">coins</p>
              </div>
            </div>
          ))}
          
          {leaderboard.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No scores yet. Play some games to get on the leaderboard!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WellnessScoreboard;