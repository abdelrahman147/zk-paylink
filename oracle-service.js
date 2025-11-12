
class BlockchainOracle {
    constructor(config = {}) {
        this.bridge = config.bridge || null;
        this.api = config.api || null;
        this.version = 'v2.0.0';
        
        // Oracle node registry
        this.nodes = new Map();
        this.nodeReputation = new Map();
        this.nodeStakes = new Map();
        
        // Data feeds
        this.priceFeeds = new Map();
        this.customFeeds = new Map();
        this.feedHistory = new Map();
        
        // Oracle aggregation
        this.aggregationMethods = {
            median: this.medianAggregation.bind(this),
            mean: this.meanAggregation.bind(this),
            weighted: this.weightedAggregation.bind(this),
            mode: this.modeAggregation.bind(this)
        };
        
        // Data verification
        this.verificationThreshold = config.verificationThreshold || 0.51; // 51% consensus
        this.minNodes = config.minNodes || 3;
        
        // Staking
        this.minStake = config.minStake || 100; // Minimum SOL stake
        this.slashThreshold = config.slashThreshold || 0.1; // 10% error rate triggers slash
        
        // Initialize
        this.init();
    }
    
    async init() {
        console.log('Initializing Blockchain Oracle Service...');
        
        // Load existing nodes from storage
        await this.loadNodes();
        
        // Start price feed updates
        this.startPriceFeedUpdates();
        
        // Start reputation updates
        this.startReputationUpdates();
        
        console.log('Oracle Service initialized');
    }
    
    // ========== PRICE FEEDS ==========
    
    async fetchPriceFeed(symbol) {
        try {
            const sources = [
                this.fetchCoinGeckoPrice.bind(this),
                this.fetchBinancePrice.bind(this),
                this.fetchCoinbasePrice.bind(this)
            ];
            
            const prices = await Promise.allSettled(
                sources.map(source => source(symbol))
            );
            
            const validPrices = prices
                .filter(p => p.status === 'fulfilled' && p.value && p.value > 0)
                .map(p => p.value);
            
            if (validPrices.length === 0) {
                throw new Error(`No valid price data for ${symbol}`);
            }
            
            // Aggregate prices
            const aggregatedPrice = this.aggregatePrices(validPrices);
            
            // Store feed
            const feedData = {
                symbol: symbol.toUpperCase(),
                price: aggregatedPrice,
                timestamp: Date.now(),
                sources: validPrices.length,
                rawPrices: validPrices
            };
            
            this.priceFeeds.set(symbol.toUpperCase(), feedData);
            this.addToFeedHistory(symbol.toUpperCase(), feedData);
            
            return feedData;
        } catch (error) {
            console.error(`Error fetching price feed for ${symbol}:`, error);
            throw error;
        }
    }
    
    async fetchCoinGeckoPrice(symbol) {
        const symbolMap = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'SOL': 'solana',
            'ZEC': 'zcash',
            'USDC': 'usd-coin',
            'USDT': 'tether'
        };
        
        const coinId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
        
        try {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
            );
            const data = await response.json();
            return data[coinId]?.usd || null;
        } catch (error) {
            console.error('CoinGecko API error:', error);
            return null;
        }
    }
    
    async fetchBinancePrice(symbol) {
        try {
            const symbolMap = {
                'BTC': 'BTCUSDT',
                'ETH': 'ETHUSDT',
                'SOL': 'SOLUSDT',
                'ZEC': 'ZECUSDT',
                'USDC': 'USDCUSDT',
                'USDT': 'USDTUSDT'
            };
            
            const pair = symbolMap[symbol.toUpperCase()] || `${symbol}USDT`;
            
            // Skip USDTUSDT as it's always 1
            if (pair === 'USDTUSDT') {
                return 1.0;
            }
            
            const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            return parseFloat(data.price) || null;
        } catch (error) {
            console.error('Binance API error:', error);
            return null;
        }
    }
    
    async fetchCoinbasePrice(symbol) {
        try {
            const symbolMap = {
                'BTC': 'BTC-USD',
                'ETH': 'ETH-USD',
                'SOL': 'SOL-USD',
                'ZEC': 'ZEC-USD',
                'USDC': 'USDC-USD',
                'USDT': 'USDT-USD'
            };
            
            const pair = symbolMap[symbol.toUpperCase()] || `${symbol}-USD`;
            const response = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${symbol}`);
            const data = await response.json();
            return parseFloat(data.data.rates.USD) || null;
        } catch (error) {
            console.error('Coinbase API error:', error);
            return null;
        }
    }
    
    aggregatePrices(prices) {
        if (prices.length === 0) return null;
        if (prices.length === 1) return prices[0];
        
        // Remove outliers (values more than 2 standard deviations from mean)
        const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
        const stdDev = Math.sqrt(variance);
        
        const filteredPrices = prices.filter(
            price => Math.abs(price - mean) <= 2 * stdDev
        );
        
        // Use median for robustness
        const sorted = [...filteredPrices].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }
    
    startPriceFeedUpdates() {
        // Update price feeds every 30 seconds
        setInterval(async () => {
            const symbols = ['BTC', 'ETH', 'SOL', 'ZEC', 'USDC', 'USDT'];
            for (const symbol of symbols) {
                try {
                    await this.fetchPriceFeed(symbol);
                } catch (error) {
                    console.error(`Failed to update ${symbol} price:`, error);
                }
            }
        }, 30000);
        
        // Initial fetch
        setTimeout(async () => {
            const symbols = ['BTC', 'ETH', 'SOL', 'ZEC', 'USDC', 'USDT'];
            for (const symbol of symbols) {
                try {
                    await this.fetchPriceFeed(symbol);
                } catch (error) {
                    console.error(`Failed to fetch initial ${symbol} price:`, error);
                }
            }
        }, 1000);
    }
    
    // ========== CUSTOM DATA FEEDS ==========
    
    async submitDataFeed(feedId, data, nodeAddress) {
        if (!this.nodes.has(nodeAddress)) {
            throw new Error('Node not registered');
        }
        
        const node = this.nodes.get(nodeAddress);
        if (node.stake < this.minStake) {
            throw new Error('Insufficient stake');
        }
        
        const feedEntry = {
            feedId,
            data,
            nodeAddress,
            timestamp: Date.now(),
            signature: await this.signData(data, nodeAddress)
        };
        
        if (!this.customFeeds.has(feedId)) {
            this.customFeeds.set(feedId, []);
        }
        
        this.customFeeds.get(feedId).push(feedEntry);
        
        // Verify consensus
        await this.verifyFeedConsensus(feedId);
        
        return feedEntry;
    }
    
    async verifyFeedConsensus(feedId) {
        const entries = this.customFeeds.get(feedId) || [];
        if (entries.length < this.minNodes) {
            return null;
        }
        
        // Group by data value
        const dataGroups = new Map();
        entries.forEach(entry => {
            const key = JSON.stringify(entry.data);
            if (!dataGroups.has(key)) {
                dataGroups.set(key, []);
            }
            dataGroups.get(key).push(entry);
        });
        
        // Find majority
        let majority = null;
        let maxCount = 0;
        
        for (const [key, group] of dataGroups.entries()) {
            if (group.length > maxCount) {
                maxCount = group.length;
                majority = JSON.parse(key);
            }
        }
        
        const consensus = maxCount / entries.length >= this.verificationThreshold;
        
        if (consensus) {
            // Update reputation for nodes that agreed
            entries.forEach(entry => {
                if (JSON.stringify(entry.data) === JSON.stringify(majority)) {
                    this.updateReputation(entry.nodeAddress, true);
                } else {
                    this.updateReputation(entry.nodeAddress, false);
                }
            });
            
            return {
                consensus: true,
                value: majority,
                agreement: maxCount,
                total: entries.length,
                confidence: maxCount / entries.length
            };
        }
        
        return {
            consensus: false,
            agreement: maxCount,
            total: entries.length
        };
    }
    
    // ========== NODE MANAGEMENT ==========
    
    async registerNode(nodeAddress, metadata = {}) {
        if (this.nodes.has(nodeAddress)) {
            throw new Error('Node already registered');
        }
        
        const node = {
            address: nodeAddress,
            registeredAt: Date.now(),
            stake: 0,
            reputation: 100,
            totalSubmissions: 0,
            correctSubmissions: 0,
            metadata: {
                name: metadata.name || `Node-${nodeAddress.substring(0, 8)}`,
                url: metadata.url || null,
                capabilities: metadata.capabilities || []
            }
        };
        
        this.nodes.set(nodeAddress, node);
        this.nodeReputation.set(nodeAddress, 100);
        this.nodeStakes.set(nodeAddress, 0);
        
        await this.saveNodes();
        
        return node;
    }
    
    async stake(nodeAddress, amount) {
        if (!this.nodes.has(nodeAddress)) {
            await this.registerNode(nodeAddress);
        }
        
        const node = this.nodes.get(nodeAddress);
        node.stake += amount;
        this.nodeStakes.set(nodeAddress, node.stake);
        
        await this.saveNodes();
        
        return {
            nodeAddress,
            totalStake: node.stake,
            minStake: this.minStake,
            qualified: node.stake >= this.minStake
        };
    }
    
    async unstake(nodeAddress, amount) {
        if (!this.nodes.has(nodeAddress)) {
            throw new Error('Node not registered');
        }
        
        const node = this.nodes.get(nodeAddress);
        if (node.stake < amount) {
            throw new Error('Insufficient stake');
        }
        
        node.stake -= amount;
        this.nodeStakes.set(nodeAddress, node.stake);
        
        await this.saveNodes();
        
        return {
            nodeAddress,
            remainingStake: node.stake
        };
    }
    
    // ========== REPUTATION SYSTEM ==========
    
    updateReputation(nodeAddress, correct) {
        if (!this.nodeReputation.has(nodeAddress)) {
            this.nodeReputation.set(nodeAddress, 100);
        }
        
        const node = this.nodes.get(nodeAddress);
        if (!node) return;
        
        node.totalSubmissions++;
        if (correct) {
            node.correctSubmissions++;
        }
        
        const accuracy = node.correctSubmissions / node.totalSubmissions;
        const reputation = Math.min(100, Math.max(0, accuracy * 100));
        
        node.reputation = reputation;
        this.nodeReputation.set(nodeAddress, reputation);
        
        // Check for slashing
        if (accuracy < (1 - this.slashThreshold) && node.stake > 0) {
            this.slashNode(nodeAddress, node.stake * 0.1); // Slash 10%
        }
        
        this.saveNodes();
    }
    
    async slashNode(nodeAddress, amount) {
        const node = this.nodes.get(nodeAddress);
        if (!node) return;
        
        const slashAmount = Math.min(amount, node.stake);
        node.stake -= slashAmount;
        this.nodeStakes.set(nodeAddress, node.stake);
        
        console.warn(`Node ${nodeAddress} slashed ${slashAmount} SOL`);
        
        await this.saveNodes();
        
        return {
            nodeAddress,
            slashed: slashAmount,
            remainingStake: node.stake
        };
    }
    
    startReputationUpdates() {
        setInterval(() => {
            this.saveNodes();
        }, 60000); // Save every minute
    }
    
    // ========== DATA AGGREGATION ==========
    
    medianAggregation(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }
    
    meanAggregation(values) {
        return values.reduce((a, b) => a + b, 0) / values.length;
    }
    
    weightedAggregation(values, weights) {
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        return values.reduce((sum, val, i) => sum + val * weights[i], 0) / totalWeight;
    }
    
    modeAggregation(values) {
        const counts = new Map();
        values.forEach(val => {
            counts.set(val, (counts.get(val) || 0) + 1);
        });
        
        let maxCount = 0;
        let mode = values[0];
        
        for (const [val, count] of counts.entries()) {
            if (count > maxCount) {
                maxCount = count;
                mode = val;
            }
        }
        
        return mode;
    }
    
    async aggregateData(feedId, method = 'median') {
        const entries = this.customFeeds.get(feedId) || [];
        if (entries.length === 0) {
            throw new Error('No data entries for feed');
        }
        
        const values = entries.map(e => e.data);
        const aggregator = this.aggregationMethods[method];
        
        if (!aggregator) {
            throw new Error(`Unknown aggregation method: ${method}`);
        }
        
        return aggregator(values);
    }
    
    // ========== FEED HISTORY ==========
    
    addToFeedHistory(feedId, data) {
        if (!this.feedHistory.has(feedId)) {
            this.feedHistory.set(feedId, []);
        }
        
        const history = this.feedHistory.get(feedId);
        history.push(data);
        
        // Keep only last 1000 entries
        if (history.length > 1000) {
            history.shift();
        }
    }
    
    getFeedHistory(feedId, limit = 100) {
        const history = this.feedHistory.get(feedId) || [];
        return history.slice(-limit);
    }
    
    // ========== UTILITIES ==========
    
    async signData(data, nodeAddress) {
        // In a real implementation, this would use cryptographic signing
        const dataString = JSON.stringify(data) + nodeAddress + Date.now();
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(dataString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    async saveNodes() {
        try {
            const nodesData = Array.from(this.nodes.entries()).map(([address, node]) => ({
                address,
                ...node
            }));
            
            localStorage.setItem('oracle_nodes', JSON.stringify(nodesData));
        } catch (error) {
            console.error('Error saving nodes:', error);
        }
    }
    
    async loadNodes() {
        try {
            const nodesData = localStorage.getItem('oracle_nodes');
            if (nodesData) {
                const nodes = JSON.parse(nodesData);
                nodes.forEach(nodeData => {
                    const { address, ...node } = nodeData;
                    this.nodes.set(address, node);
                    this.nodeReputation.set(address, node.reputation || 100);
                    this.nodeStakes.set(address, node.stake || 0);
                });
            }
        } catch (error) {
            console.error('Error loading nodes:', error);
        }
    }
    
    // ========== API METHODS ==========
    
    getPriceFeed(symbol) {
        return this.priceFeeds.get(symbol.toUpperCase()) || null;
    }
    
    getAllPriceFeeds() {
        return Array.from(this.priceFeeds.values());
    }
    
    getNodeInfo(nodeAddress) {
        return this.nodes.get(nodeAddress) || null;
    }
    
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
    
    getFeedConsensus(feedId) {
        return this.verifyFeedConsensus(feedId);
    }
    
    getStats() {
        return {
            totalNodes: this.nodes.size,
            activeNodes: Array.from(this.nodes.values()).filter(n => n.stake >= this.minStake).length,
            totalStaked: Array.from(this.nodeStakes.values()).reduce((a, b) => a + b, 0),
            priceFeeds: this.priceFeeds.size,
            customFeeds: this.customFeeds.size,
            version: this.version
        };
    }
}

if (typeof window !== 'undefined') {
    window.BlockchainOracle = BlockchainOracle;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlockchainOracle;
}

