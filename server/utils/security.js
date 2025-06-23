import { HashingUtils } from './hashing.js';

export class SecurityUtils {
  static async collisionTest(input, method) {
    const variations = [
      input,
      input + ' ',
      input.toUpperCase(),
      input.toLowerCase(),
      input + '1',
      input.split('').reverse().join('')
    ];

    const hashes = [];
    let totalTime = 0;

    for (const variation of variations) {
      let result;
      switch (method) {
        case 'BLAKE3':
          result = await HashingUtils.blake3HashFn(variation);
          break;
        case 'SHA512+BLAKE3':
          result = await HashingUtils.combinedHash(variation);
          break;
        default:
          result = await HashingUtils.sha512Hash(variation);
      }
      hashes.push(result.hash);
      totalTime += result.time;
    }

    // Check for collisions
    const uniqueHashes = new Set(hashes);
    const collisionResistance = uniqueHashes.size === hashes.length;
    const score = collisionResistance ? 100 : (uniqueHashes.size / hashes.length) * 100;

    return {
      result: collisionResistance ? 'PASS' : 'FAIL',
      score: Math.round(score),
      details: {
        totalVariations: variations.length,
        uniqueHashes: uniqueHashes.size,
        collisions: hashes.length - uniqueHashes.size,
        averageTime: totalTime / variations.length,
        hashes: hashes.slice(0, 3) // Return first 3 for display
      }
    };
  }

  static async entropyTest(input, method) {
    let result;
    switch (method) {
      case 'BLAKE3':
        result = await HashingUtils.blake3HashFn(input);
        break;
      case 'SHA512+BLAKE3':
        result = await HashingUtils.combinedHash(input);
        break;
      default:
        result = await HashingUtils.sha512Hash(input);
    }

    const hash = result.hash;
    
    // Calculate entropy (simplified)
    const charFreq = {};
    for (const char of hash) {
      charFreq[char] = (charFreq[char] || 0) + 1;
    }

    let entropy = 0;
    const length = hash.length;
    
    for (const freq of Object.values(charFreq)) {
      const probability = freq / length;
      entropy -= probability * Math.log2(probability);
    }

    const maxEntropy = Math.log2(16); // For hex characters
    const entropyRatio = entropy / maxEntropy;
    const score = Math.round(entropyRatio * 100);

    return {
      result: score > 90 ? 'EXCELLENT' : score > 70 ? 'GOOD' : 'POOR',
      score,
      details: {
        entropy: entropy.toFixed(3),
        maxEntropy: maxEntropy.toFixed(3),
        ratio: entropyRatio.toFixed(3),
        uniqueChars: Object.keys(charFreq).length,
        executionTime: result.time
      }
    };
  }

  static async avalancheTest(input, method) {
    // Test avalanche effect by changing one bit
    const originalInput = input;
    const modifiedInput = input.length > 0 ? 
      (input.charAt(0) === 'a' ? 'b' + input.slice(1) : 'a' + input.slice(1)) : 
      'a';

    let originalResult, modifiedResult;
    
    switch (method) {
      case 'BLAKE3':
        originalResult = await HashingUtils.blake3HashFn(originalInput);
        modifiedResult = await HashingUtils.blake3HashFn(modifiedInput);
        break;
      case 'SHA512+BLAKE3':
        originalResult = await HashingUtils.combinedHash(originalInput);
        modifiedResult = await HashingUtils.combinedHash(modifiedInput);
        break;
      default:
        originalResult = await HashingUtils.sha512Hash(originalInput);
        modifiedResult = await HashingUtils.sha512Hash(modifiedInput);
    }

    // Count different bits
    const hash1 = originalResult.hash;
    const hash2 = modifiedResult.hash;
    
    let differentBits = 0;
    const minLength = Math.min(hash1.length, hash2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (hash1[i] !== hash2[i]) {
        differentBits++;
      }
    }

    const changePercentage = (differentBits / minLength) * 100;
    const score = Math.round(changePercentage);

    return {
      result: score > 40 ? 'EXCELLENT' : score > 25 ? 'GOOD' : 'POOR',
      score,
      details: {
        originalHash: hash1.substring(0, 32) + '...',
        modifiedHash: hash2.substring(0, 32) + '...',
        differentChars: differentBits,
        totalChars: minLength,
        changePercentage: changePercentage.toFixed(2),
        averageTime: (originalResult.time + modifiedResult.time) / 2
      }
    };
  }

  static async comprehensiveTest(input, method) {
    const collisionTest = await this.collisionTest(input, method);
    const entropyTest = await this.entropyTest(input, method);
    const avalancheTest = await this.avalancheTest(input, method);

    const overallScore = Math.round(
      (collisionTest.score + entropyTest.score + avalancheTest.score) / 3
    );

    return {
      result: overallScore > 85 ? 'EXCELLENT' : overallScore > 70 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      score: overallScore,
      details: {
        collision: collisionTest,
        entropy: entropyTest,
        avalanche: avalancheTest,
        summary: {
          totalTests: 3,
          passedTests: [collisionTest, entropyTest, avalancheTest].filter(t => 
            t.result === 'PASS' || t.result === 'EXCELLENT' || t.result === 'GOOD'
          ).length
        }
      }
    };
  }
}