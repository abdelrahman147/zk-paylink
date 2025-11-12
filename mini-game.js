

class MiniGame {
    constructor(config = {}) {
        this.api = config.api || null;
        this.gameWallet = 'Hw87YF66ND8v7yAyJKEJqMvDxZrHAHiHy8qsWghddC2Z'; 
        this.adminWallet = '7FSRx9hk9GHcqJNRsG8B9oTLSZSohNB7TZc9pPio45Gn'; 
        this.gameCost = 0.01; 
        this.score = 0;
        this.isPlaying = false;
        this.gameStartTime = null;
        this.targets = [];
        this.missedTargets = 0;
        this.maxMissed = 5;
    }

    
    init(apiInstance) {
        this.api = apiInstance;
    }

    
    async startGame() {
        if (!this.api || !this.api.bridge || !this.api.bridge.solanaWallet) {
            throw new Error('Please connect your Solana wallet first');
        }

        if (this.isPlaying) {
            throw new Error('Game already in progress');
        }

        try {
            // Game is now free to play - just need wallet connection
            this.score = 0;
            this.missedTargets = 0;
            this.targets = [];
            this.isPlaying = true;
            this.gameStartTime = Date.now();
            this.paymentSignature = null; // No payment needed

            return {
                success: true,
                paymentSignature: null,
                isAdmin: false,
                message: 'Game starting...'
            };
        } catch (error) {
            throw new Error('Failed to start game: ' + error.message);
        }
    }

    
    createTarget(gameAreaWidth = 800, gameAreaHeight = 500) {
        
        const difficulty = Math.min(1 + Math.floor(this.score / 100), 5);
        
        const target = {
            id: Date.now() + Math.random(),
            x: Math.random() * (gameAreaWidth - 100),
            y: Math.random() * (gameAreaHeight - 100),
            size: Math.max(30, 60 - (difficulty * 5)), 
            speed: 0.5 + (difficulty * 0.3),
            points: Math.floor(10 + (difficulty * 5) + Math.random() * 15),
            createdAt: Date.now(),
            lifetime: Math.max(2000, 4000 - (difficulty * 300)), 
            color: this.getTargetColor(difficulty)
        };
        this.targets.push(target);
        return target;
    }
    
    
    getTargetColor(difficulty) {
        const colors = [
            '#00d4ff', 
            '#00ff88', 
            '#ffaa00', 
            '#ff4444', 
            '#ff00ff'  
        ];
        return colors[Math.min(difficulty - 1, colors.length - 1)];
    }

    
    hitTarget(targetId) {
        if (!this.isPlaying) return false;

        const targetIndex = this.targets.findIndex(t => t.id === targetId);
        if (targetIndex === -1) return false;

        const target = this.targets[targetIndex];
        const elapsed = Date.now() - target.createdAt;
        const timeBonus = Math.max(0, target.lifetime - elapsed);
        const bonusMultiplier = Math.floor(timeBonus / 200); 
        const points = target.points + bonusMultiplier;

        this.score += points;
        this.targets.splice(targetIndex, 1);

        return {
            hit: true,
            points: points,
            totalScore: this.score,
            bonus: bonusMultiplier,
            target: target
        };
    }

    
    missTarget() {
        if (!this.isPlaying) return;

        this.missedTargets++;
        if (this.missedTargets >= this.maxMissed) {
            this.endGame();
        }
    }

    
    endGame() {
        if (!this.isPlaying) return null;

        const duration = Date.now() - this.gameStartTime;
        const finalScore = this.score;
        
        this.isPlaying = false;
        this.targets = [];
        this.gameStartTime = null;

        return {
            score: finalScore,
            duration: duration,
            missedTargets: this.missedTargets,
            paymentSignature: this.paymentSignature || null
        };
    }

    
    getStats() {
        return {
            isPlaying: this.isPlaying,
            score: this.score,
            missedTargets: this.missedTargets,
            remainingLives: Math.max(0, this.maxMissed - this.missedTargets),
            targetsActive: this.targets.length,
            gameTime: this.gameStartTime ? Date.now() - this.gameStartTime : 0
        };
    }
}


if (typeof window !== 'undefined') {
    window.MiniGame = MiniGame;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MiniGame;
}

