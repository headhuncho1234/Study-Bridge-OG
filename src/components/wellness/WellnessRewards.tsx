import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Palette, User, Award, Lock, Check } from "lucide-react";

interface WellnessRewardsProps {
  coins: number;
  onPurchase: (item: string, cost: number) => void;
  ownedItems: string[];
}

const WellnessRewards = ({ coins, onPurchase, ownedItems }: WellnessRewardsProps) => {
  const [selectedCategory, setSelectedCategory] = useState('themes');

  const rewardItems = {
    themes: [
      { id: 'ocean-theme', name: 'Ocean Breeze Theme', cost: 5, preview: 'Blue gradient with wave patterns' },
      { id: 'forest-theme', name: 'Forest Zen Theme', cost: 7, preview: 'Green tones with nature elements' },
      { id: 'sunset-theme', name: 'Golden Sunset Theme', cost: 10, preview: 'Warm oranges and pinks' },
      { id: 'space-theme', name: 'Cosmic Space Theme', cost: 15, preview: 'Dark purple with stars' }
    ],
    avatars: [
      { id: 'meditation-pose', name: 'Meditation Pose', cost: 3, preview: '🧘‍♀️' },
      { id: 'yoga-warrior', name: 'Yoga Warrior', cost: 5, preview: '🤸‍♀️' },
      { id: 'zen-master', name: 'Zen Master Robes', cost: 8, preview: '👘' },
      { id: 'nature-crown', name: 'Nature Crown', cost: 12, preview: '🌿' },
      { id: 'wellness-halo', name: 'Wellness Halo', cost: 20, preview: '😇' }
    ],
    badges: [
      { id: 'focus-master', name: 'Focus Master', cost: 6, preview: '🎯 Forum title upgrade' },
      { id: 'wellness-advocate', name: 'Wellness Advocate', cost: 10, preview: '💚 Special forum badge' },
      { id: 'mindfulness-guru', name: 'Mindfulness Guru', cost: 15, preview: '🏆 Premium forum status' },
      { id: 'zen-champion', name: 'Zen Champion', cost: 25, preview: '👑 Elite forum privileges' }
    ]
  };

  const canAfford = (cost: number) => coins >= cost;
  const isOwned = (itemId: string) => ownedItems.includes(itemId);

  const handlePurchase = (item: any) => {
    if (canAfford(item.cost) && !isOwned(item.id)) {
      onPurchase(item.id, item.cost);
    }
  };

  const renderRewardCard = (item: any, category: string) => (
    <Card key={item.id} className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">{item.name}</h4>
              <p className="text-sm text-muted-foreground">{item.preview}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-500">
                <Coins className="h-4 w-4" />
                <span className="font-bold">{item.cost}</span>
              </div>
            </div>
          </div>
          
          {isOwned(item.id) ? (
            <Badge className="w-full justify-center bg-green-500">
              <Check className="h-4 w-4 mr-1" />
              Owned
            </Badge>
          ) : (
            <Button 
              onClick={() => handlePurchase(item)}
              disabled={!canAfford(item.cost)}
              className="w-full"
              variant={canAfford(item.cost) ? "default" : "secondary"}
            >
              {canAfford(item.cost) ? (
                <>
                  <Coins className="h-4 w-4 mr-1" />
                  Purchase
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-1" />
                  Need {item.cost - coins} more coins
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Wellness Rewards Shop
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-yellow-500" />
            {coins} Coins
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Spend your wellness coins on dashboard themes, avatar upgrades, and forum badges!
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="avatars" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Avatars
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Badges
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="themes" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewardItems.themes.map(item => renderRewardCard(item, 'themes'))}
            </div>
          </TabsContent>
          
          <TabsContent value="avatars" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewardItems.avatars.map(item => renderRewardCard(item, 'avatars'))}
            </div>
          </TabsContent>
          
          <TabsContent value="badges" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewardItems.badges.map(item => renderRewardCard(item, 'badges'))}
            </div>
          </TabsContent>
        </Tabs>
        
        <Card className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              How to Earn More Coins
            </h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>• Complete Focus Quest sessions (+1 coin each)</p>
              <p>• Unlock breathing exercises (+2 bonus coins)</p>
              <p>• Maintain focus streaks (bonus coins for milestones)</p>
              <p>• Participate in wellness community activities</p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default WellnessRewards;