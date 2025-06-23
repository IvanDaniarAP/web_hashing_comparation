import { sha512 } from 'js-sha512';
import { hash as blake3Hash } from 'blake3';

export class HashingUtils {
  static async sha512Hash(data: string): Promise<{ hash: string; time: number }> {
    const start = performance.now();
    const hash = sha512(data);
    const time = performance.now() - start;
    return { hash, time };
  }

  static async blake3HashFn(data: string): Promise<{ hash: string; time: number }> {
    const start = performance.now();
    const encoder = new TextEncoder();
    const hash = blake3Hash(encoder.encode(data)).toString('hex');
    const time = performance.now() - start;
    return { hash, time };
  }

  static async combinedHash(data: string): Promise<{ hash: string; time: number }> {
    const start = performance.now();
    
    // First pass with SHA512
    const sha512Result = sha512(data);
    
    // Second pass with BLAKE3 on SHA512 result
    const encoder = new TextEncoder();
    const finalHash = blake3Hash(encoder.encode(sha512Result)).toString('hex');
    
    const time = performance.now() - start;
    return { hash: finalHash, time };
  }

  static async performanceTest(data: string, iterations: number = 1000) {
    const results = {
      sha512: { times: [] as number[], hashes: [] as string[] },
      blake3: { times: [] as number[], hashes: [] as string[] },
      combined: { times: [] as number[], hashes: [] as string[] }
    };

    // Test SHA512
    for (let i = 0; i < iterations; i++) {
      const result = await this.sha512Hash(data + i);
      results.sha512.times.push(result.time);
      results.sha512.hashes.push(result.hash);
    }

    // Test BLAKE3
    for (let i = 0; i < iterations; i++) {
      const result = await this.blake3HashFn(data + i);
      results.blake3.times.push(result.time);
      results.blake3.hashes.push(result.hash);
    }

    // Test Combined
    for (let i = 0; i < iterations; i++) {
      const result = await this.combinedHash(data + i);
      results.combined.times.push(result.time);
      results.combined.hashes.push(result.hash);
    }

    return {
      sha512: {
        averageTime: results.sha512.times.reduce((a, b) => a + b, 0) / iterations,
        minTime: Math.min(...results.sha512.times),
        maxTime: Math.max(...results.sha512.times),
        throughput: iterations / (results.sha512.times.reduce((a, b) => a + b, 0) / 1000)
      },
      blake3: {
        averageTime: results.blake3.times.reduce((a, b) => a + b, 0) / iterations,
        minTime: Math.min(...results.blake3.times),
        maxTime: Math.max(...results.blake3.times),
        throughput: iterations / (results.blake3.times.reduce((a, b) => a + b, 0) / 1000)
      },
      combined: {
        averageTime: results.combined.times.reduce((a, b) => a + b, 0) / iterations,
        minTime: Math.min(...results.combined.times),
        maxTime: Math.max(...results.combined.times),
        throughput: iterations / (results.combined.times.reduce((a, b) => a + b, 0) / 1000)
      }
    };
  }
}