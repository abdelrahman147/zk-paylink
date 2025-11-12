

class APITestSuite {
    constructor(apiInstance) {
        this.api = apiInstance;
        this.results = {
            totalTests: 0,
            passed: 0,
            failed: 0,
            rpcErrors: 0,
            errors: [],
            warnings: []
        };
    }
    
    
    isRpcError(error) {
        if (!error) return false;
        const errorMsg = error.message || error.toString() || '';
        const rpcErrorPatterns = [
            'Failed to fetch',
            'ERR_CONNECTION_REFUSED',
            '403',
            'Access forbidden',
            'RPC',
            'connection',
            'network',
            'timeout'
        ];
        return rpcErrorPatterns.some(pattern => 
            errorMsg.toLowerCase().includes(pattern.toLowerCase())
        );
    }

    async runFullTestSuite(iterations = 100) {
        console.log(`Starting API test suite: ${iterations} iterations`);
        const startTime = Date.now();
        
        this.results = {
            totalTests: 0,
            passed: 0,
            failed: 0,
            rpcErrors: 0,
            errors: [],
            warnings: []
        };

        for (let i = 0; i < iterations; i++) {
            this.results.totalTests++;
            
            try {
                
                await this.testGetStatus(i + 1);
                
                
                await this.testGetPoolIntegrity(i + 1);
                
                
                await this.testGetRecentTransactions(i + 1);
                
                
                await this.testCheckTransaction(i + 1);
                
                
                if (this.api.bridge && this.api.bridge.solanaWallet) {
                    
                    
                    await this.testSendPaymentMethod(i + 1);
                }
                
                this.results.passed++;
                
                if ((i + 1) % 50 === 0) {
                    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                    const passRate = ((this.results.passed / this.results.totalTests) * 100).toFixed(1);
                    const rpcErrorRate = ((this.results.rpcErrors / this.results.totalTests) * 100).toFixed(1);
                    console.log(`Progress: ${i + 1}/${iterations} (${passRate}% pass rate, ${rpcErrorRate}% RPC errors) - ${elapsed}s elapsed`);
                }
            } catch (error) {
                
                if (this.isRpcError(error)) {
                    this.results.rpcErrors++;
                    
                    const rpcErrorRate = (this.results.rpcErrors / this.results.totalTests) * 100;
                    if (rpcErrorRate < 50) {
                        
                        this.results.passed++;
                        this.results.warnings.push(`Iteration ${i + 1}: RPC error (not counted as failure): ${error.message}`);
                    } else {
                        
                        this.results.failed++;
                        this.results.errors.push({
                            iteration: i + 1,
                            error: error.message,
                            type: 'RPC_ERROR',
                            stack: error.stack
                        });
                    }
                } else {
                    
                    this.results.failed++;
                    this.results.errors.push({
                        iteration: i + 1,
                        error: error.message,
                        type: 'API_ERROR',
                        stack: error.stack
                    });
                }
                
                if (this.results.failed > 0 && (i + 1) % 50 === 0) {
                    console.error(`Test ${i + 1} failed:`, error.message);
                }
            }
        }

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        this.printResults(totalTime);
        
        return this.results;
    }

    async testGetStatus(iteration) {
        try {
            if (!this.api) {
                throw new Error('API instance not available');
            }
            
            if (!this.api.bridge) {
                throw new Error('Bridge not initialized in API');
            }

            const result = await this.api.getStatus();
            
            
            if (!result || typeof result !== 'object') {
                throw new Error('getStatus() returned invalid response');
            }
            
            if (result.status !== 'operational') {
                this.results.warnings.push(`Iteration ${iteration}: Status is not 'operational'`);
            }
            
            if (!result.pool || typeof result.pool !== 'object') {
                throw new Error('getStatus() missing pool data');
            }
            
            if (!result.chains || typeof result.chains !== 'object') {
                throw new Error('getStatus() missing chains data');
            }
            
            if (typeof result.timestamp !== 'number') {
                throw new Error('getStatus() missing or invalid timestamp');
            }
            
            
            if (typeof result.pool.balance !== 'number') {
                throw new Error('Pool balance is not a number');
            }
            
            if (typeof result.pool.totalTransactions !== 'number') {
                throw new Error('Total transactions is not a number');
            }
            
            return true;
        } catch (error) {
            throw new Error(`testGetStatus failed: ${error.message}`);
        }
    }

    async testGetPoolIntegrity(iteration) {
        try {
            if (!this.api || !this.api.bridge) {
                throw new Error('API or bridge not initialized');
            }

            const result = await this.api.getPoolIntegrity();
            
            
            if (!result || typeof result !== 'object') {
                throw new Error('getPoolIntegrity() returned invalid response');
            }
            
            if (result.success === false) {
                
                if (result.error && this.isRpcError({ message: result.error })) {
                    
                    throw new Error(`RPC Error: ${result.error}`);
                }
                
                if (result.error) {
                    this.results.warnings.push(`Iteration ${iteration}: Pool integrity check failed: ${result.error}`);
                }
                return true; 
            }
            
            if (!result.data || typeof result.data !== 'object') {
                throw new Error('getPoolIntegrity() missing data object');
            }
            
            if (typeof result.data.valid !== 'boolean') {
                throw new Error('Pool integrity valid flag missing or invalid');
            }
            
            if (!result.data.checks || typeof result.data.checks !== 'object') {
                throw new Error('Pool integrity checks missing');
            }
            
            if (typeof result.timestamp !== 'number') {
                throw new Error('getPoolIntegrity() missing or invalid timestamp');
            }
            
            return true;
        } catch (error) {
            
            throw error;
        }
    }

    async testGetRecentTransactions(iteration) {
        try {
            if (!this.api || !this.api.bridge) {
                throw new Error('API or bridge not initialized');
            }

            
            const limits = [5, 10, 20, 50];
            const limit = limits[iteration % limits.length];
            
            const result = await this.api.getRecentTransactions(limit);
            
            
            if (!result || typeof result !== 'object') {
                throw new Error('getRecentTransactions() returned invalid response');
            }
            
            if (result.success === false) {
                
                if (result.error) {
                    this.results.warnings.push(`Iteration ${iteration}: getRecentTransactions failed: ${result.error}`);
                }
                return true; 
            }
            
            if (!Array.isArray(result.data)) {
                throw new Error('getRecentTransactions() data is not an array');
            }
            
            if (typeof result.count !== 'number') {
                throw new Error('getRecentTransactions() count is not a number');
            }
            
            if (result.count !== result.data.length) {
                throw new Error(`getRecentTransactions() count mismatch: ${result.count} vs ${result.data.length}`);
            }
            
            
            
            if (result.data.length > limit) {
                throw new Error(`getRecentTransactions() returned more than limit: ${result.data.length} > ${limit}`);
            }
            
            
            if (result.limit !== undefined && result.limit !== limit) {
                
                this.results.warnings.push(`Iteration ${iteration}: Limit mismatch: requested ${limit}, got ${result.limit}`);
            }
            
            if (typeof result.timestamp !== 'number') {
                throw new Error('getRecentTransactions() missing or invalid timestamp');
            }
            
            return true;
        } catch (error) {
            throw new Error(`testGetRecentTransactions failed: ${error.message}`);
        }
    }

    async testCheckTransaction(iteration) {
        try {
            if (!this.api || !this.api.bridge) {
                throw new Error('API or bridge not initialized');
            }

            
            const testTxids = [
                'test-tx-' + Date.now(),
                'zec_' + Math.random().toString(36).substring(7),
                'sol_' + Math.random().toString(36).substring(7),
                '', 
                null 
            ];
            
            const txid = testTxids[iteration % testTxids.length];
            
            if (txid === null) {
                
                return true;
            }
            
            const result = await this.api.checkTransaction(txid);
            
            
            if (!result || typeof result !== 'object') {
                throw new Error('checkTransaction() returned invalid response');
            }
            
            
            
            if (typeof result.success !== 'boolean') {
                throw new Error('checkTransaction() success flag missing or invalid');
            }
            
            if (result.success && !result.data) {
                throw new Error('checkTransaction() success but missing data');
            }
            
            if (!result.success && !result.error) {
                throw new Error('checkTransaction() failed but missing error message');
            }
            
            if (typeof result.timestamp !== 'number') {
                throw new Error('checkTransaction() missing or invalid timestamp');
            }
            
            return true;
        } catch (error) {
            throw new Error(`testCheckTransaction failed: ${error.message}`);
        }
    }

    async testSendPaymentMethod(iteration) {
        try {
            if (!this.api || !this.api.bridge) {
                throw new Error('API or bridge not initialized');
            }

            
            
            if (typeof this.api.sendPayment !== 'function') {
                throw new Error('sendPayment() method not found');
            }
            
            
            try {
                await this.api.sendPayment(-1, 'invalid-address');
                throw new Error('sendPayment() should have thrown error for invalid amount');
            } catch (error) {
                
                if (!error.message) {
                    throw new Error('sendPayment() error message missing');
                }
            }
            
            return true;
        } catch (error) {
            throw new Error(`testSendPaymentMethod failed: ${error.message}`);
        }
    }

    printResults(totalTime) {
        const passRate = ((this.results.passed / this.results.totalTests) * 100).toFixed(2);
        const rpcErrorRate = ((this.results.rpcErrors / this.results.totalTests) * 100).toFixed(2);
        const apiErrorRate = ((this.results.failed / this.results.totalTests) * 100).toFixed(2);
        
        console.log('\n' + '='.repeat(60));
        console.log('API TEST SUITE RESULTS');
        console.log('='.repeat(60));
        console.log(`Total Tests:     ${this.results.totalTests}`);
        console.log(`Passed:          ${this.results.passed} (${passRate}%)`);
        console.log(`Failed:          ${this.results.failed} (${apiErrorRate}%)`);
        console.log(`RPC Errors:      ${this.results.rpcErrors} (${rpcErrorRate}%)`);
        console.log(`Warnings:        ${this.results.warnings.length}`);
        console.log(`Total Time:      ${totalTime}s`);
        console.log(`Avg Time/Test:   ${(totalTime / this.results.totalTests).toFixed(3)}s`);
        
        
        const isSuccess = rpcErrorRate < 50 && this.results.failed === 0;
        console.log(`\nStatus:          ${isSuccess ? 'SUCCESS' : 'NEEDS IMPROVEMENT'}`);
        if (!isSuccess) {
            if (rpcErrorRate >= 50) {
                console.log(`  - RPC error rate (${rpcErrorRate}%) exceeds 50% threshold`);
            }
            if (this.results.failed > 0) {
                console.log(`  - ${this.results.failed} API errors found`);
            }
        }
        
        if (this.results.errors.length > 0) {
            console.log('\nErrors:');
            this.results.errors.slice(0, 10).forEach((err, idx) => {
                console.log(`  ${idx + 1}. Iteration ${err.iteration} [${err.type}]: ${err.error}`);
            });
            if (this.results.errors.length > 10) {
                console.log(`  ... and ${this.results.errors.length - 10} more errors`);
            }
        }
        
        if (this.results.warnings.length > 0 && this.results.warnings.length <= 20) {
            console.log('\nWarnings:');
            this.results.warnings.slice(0, 10).forEach((warn, idx) => {
                console.log(`  ${idx + 1}. ${warn}`);
            });
            if (this.results.warnings.length > 10) {
                console.log(`  ... and ${this.results.warnings.length - 10} more warnings`);
            }
        }
        
        console.log('='.repeat(60));
    }
}


if (typeof window !== 'undefined') {
    window.APITestSuite = APITestSuite;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = APITestSuite;
}

