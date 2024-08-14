import { MerkleTree } from "merkletreejs";
const SHA256 = require("crypto-js/sha256");
import fs from "fs";

const charSim = 1 * Math.pow(10, -6); // 1 microsecond per character
const bs64_tides = fs.readFileSync("base64_tides.txt", "utf8");

function mimicNetworkUnreliability(file: string, unreliability: number): string {
    return Math.random() < unreliability ? file.substr(0, file.length - Math.ceil(file.length * unreliability)) : file;
}

function partitionString(string: string, numPartitions: number): string[] {
    if (numPartitions <= 0) return ["Invalid number of partitions"];
    const partitionSize = Math.ceil(string.length / numPartitions);
    const partitions: string[] = [];
    for (let i = 0; i < string.length; i += partitionSize) {
        partitions.push(string.substring(i, i + partitionSize));
    }
    if (partitions.length > numPartitions) {
        partitions[partitions.length - 2] += partitions.pop();
    }
    return partitions;
}

function requeryCorrupted(
    tree: MerkleTree,
    corruptedPartitions: string[],
    originalRoot: string,
    unreliability: number
): { root: string; time: number } {
    const leaves = tree.getLeaves();
    let localTime = 0;

    for (let i = 0; i < corruptedPartitions.length; i++) {
        const leaf = corruptedPartitions[i];
        const proof = tree.getProof(leaves[i]);
        const isValidLeaf = tree.verify(proof, leaf, originalRoot);

        if (!isValidLeaf) {
            let attempts = 0;
            while (attempts < 5) {
                localTime += (leaf.length + JSON.stringify(proof).length) * charSim;
                if (Math.random() >= unreliability) {
                    corruptedPartitions[i] = leaves[i].toString();
                    break;
                }
                attempts++;
            }
            // Add penalty for failed transmission, but make it less severe for smaller partitions
            if (attempts === 5) {
                localTime += leaf.length * charSim * 5 / Math.sqrt(corruptedPartitions.length);
            }
        }
    }

    // Adjust overhead for managing partitions
    localTime += corruptedPartitions.length * Math.log2(corruptedPartitions.length) * 0.00001;

    const finalTree = new MerkleTree(corruptedPartitions, SHA256);
    return { root: finalTree.getRoot().toString("hex"), time: localTime };
}

function testingPowers(unreliability: number): any[] {
    let results: any = [];
    for (let i = 1; i <= 12; i++) {
        const numPartitions = Math.pow(2, i);
        const partitions = partitionString(bs64_tides, numPartitions);
        const tree = new MerkleTree(partitions, SHA256);
        const corruptedPartitions = partitions.map(x => mimicNetworkUnreliability(x, unreliability));
        const root = tree.getRoot().toString("hex");

        const start = performance.now();
        const { root: finalRoot, time: localTime } = requeryCorrupted(tree, corruptedPartitions, root, unreliability);
        const end = performance.now();

        // Adjust base time to account for benefits of parallel transmission
        const baseTime = (bs64_tides.length * charSim) / Math.sqrt(numPartitions);
        const totalTime = (end - start) / 1000 + localTime + baseTime;
        results.push({ partitions: numPartitions, time: totalTime });
        console.log(`${totalTime.toFixed(3)}`);
    }
    return results;
}

console.log("Testing with 33% unreliability");
const results33 = testingPowers(0.33);

console.log("\nTesting with 66% unreliability");
const results66 = testingPowers(0.66);

console.log("\nTesting with 99% unreliability");
const results99 = testingPowers(0.99);

// import { MerkleTree } from "merkletreejs";
// // import SHA256 from "crypto-js/sha256";
// import fs from "fs";

// const charSim = 1 * Math.pow(10, -6); // 1 microsecond per character
// const bs64_tides = fs.readFileSync("base64_tides.txt", "utf8");

// interface NetworkState {
//     baseReliability: number;
//     time: number;
//     inBurst: boolean;
//     burstStartTime: number;
//     totalReliability: number;
//     measurementCount: number;
//     burstCount: number;
//     burstDuration: number;
// }

// function createNetworkState(baseReliability: number): NetworkState {
//     return {
//         baseReliability,
//         time: 0,
//         inBurst: false,
//         burstStartTime: 0,
//         totalReliability: 0,
//         measurementCount: 0,
//         burstCount: 0,
//         burstDuration: 0
//     };
// }

// function getCurrentReliability(state: NetworkState): number {
//     const burstProbability = 0.05;
//     const burstSeverity = 0.5;
//     const burstDuration = 1000; // milliseconds

//     // Time-based fluctuation
//     const timeFluctuation = Math.sin(state.time / 10000) * 0.1;
    
//     // Burst error model
//     if (!state.inBurst && Math.random() < burstProbability) {
//         state.inBurst = true;
//         state.burstStartTime = state.time;
//         state.burstCount++;
//     }

//     if (state.inBurst && (state.time - state.burstStartTime) > burstDuration) {
//         state.inBurst = false;
//         state.burstDuration += burstDuration;
//     }

//     const burstEffect = state.inBurst ? burstSeverity : 0;

//     // Combine base reliability with time fluctuation and burst effect
//     let currentReliability = state.baseReliability + timeFluctuation - burstEffect;
    
//     // Ensure reliability stays between 0 and 1
//     currentReliability = Math.max(0, Math.min(1, currentReliability));

//     // Update total reliability and measurement count
//     state.totalReliability += currentReliability;
//     state.measurementCount++;

//     return currentReliability;
// }

// function incrementTime(state: NetworkState, amount: number): void {
//     state.time += amount;
// }

// function mimicNetworkUnreliability(file: string, state: NetworkState): string {
//     const reliability = getCurrentReliability(state);
//     return Math.random() < reliability ? file : file.substr(0, file.length - Math.ceil(file.length * (1 - reliability)));
// }

// function partitionString(string: string, numPartitions: number): string[] {
//     if (numPartitions <= 0) return ["Invalid number of partitions"];
//     const partitionSize = Math.ceil(string.length / numPartitions);
//     const partitions: string[] = [];
//     for (let i = 0; i < string.length; i += partitionSize) {
//         partitions.push(string.substring(i, i + partitionSize));
//     }
//     if (partitions.length > numPartitions) {
//         partitions[partitions.length - 2] += partitions.pop();
//     }
//     return partitions;
// }

// function requeryCorrupted(
//     tree: MerkleTree,
//     corruptedPartitions: string[],
//     originalRoot: string,
//     state: NetworkState
// ): { root: string; time: number } {
//     const leaves = tree.getLeaves();
//     let localTime = 0;
    
//     for (let i = 0; i < corruptedPartitions.length; i++) {
//         const leaf = corruptedPartitions[i];
//         const proof = tree.getProof(leaves[i]);
//         const isValidLeaf = tree.verify(proof, leaf, originalRoot);
        
//         if (!isValidLeaf) {
//             let attempts = 0;
//             let backoffTime = 100; // Initial backoff time in milliseconds
//             while (true) {
//                 localTime += (leaf.length + JSON.stringify(proof).length) * charSim;
//                 incrementTime(state, backoffTime);
//                 if (Math.random() < getCurrentReliability(state)) {
//                     corruptedPartitions[i] = leaves[i].toString();
//                     break;
//                 }
//                 attempts++;
//                 // Exponential backoff
//                 localTime += backoffTime / 1000; // Convert ms to seconds
//                 backoffTime *= 2; // Double the backoff time for next attempt
                
//                 // Optional: Add a maximum backoff time
//                 if (backoffTime > 5000) { // Max 5 seconds
//                     backoffTime = 5000;
//                 }
                
//                 // Optional: Add a maximum number of attempts
//                 if (attempts > 10) {
//                     localTime += leaf.length * charSim * 10 / Math.sqrt(corruptedPartitions.length);
//                     break;
//                 }
//             }
//         }
//     }
    
//     // Adjust overhead for managing partitions
//     localTime += corruptedPartitions.length * Math.log2(corruptedPartitions.length) * 0.00001;
    
//     const finalTree = new MerkleTree(corruptedPartitions, SHA256);
//     return { root: finalTree.getRoot().toString("hex"), time: localTime };
// }

// interface SimulationResult {
//     partitions: number;
//     time: number;
//     averageReliability: number;
//     burstFrequency: number;
//     burstPercentage: number;
// }

// function testingPowers(baseReliability: number): SimulationResult[] {
//     let results: SimulationResult[] = [];
//     const networkState = createNetworkState(baseReliability);
//     for (let i = 1; i <= 12; i++) {
//         const numPartitions = Math.pow(2, i);
//         const partitions = partitionString(bs64_tides, numPartitions);
//         const tree = new MerkleTree(partitions, SHA256);
//         const corruptedPartitions = partitions.map(x => mimicNetworkUnreliability(x, networkState));
//         const root = tree.getRoot().toString("hex");
        
//         const start = performance.now();
//         const { root: finalRoot, time: localTime } = requeryCorrupted(tree, corruptedPartitions, root, networkState);
//         const end = performance.now();
        
//         // Adjust base time to account for benefits of parallel transmission
//         const baseTime = (bs64_tides.length * charSim) / Math.sqrt(numPartitions);
//         const totalTime = (end - start) / 1000 + localTime + baseTime;

//         const averageReliability = networkState.totalReliability / networkState.measurementCount;
//         const burstFrequency = networkState.burstCount / (networkState.time / 1000); // bursts per second
//         const burstPercentage = (networkState.burstDuration / networkState.time) * 100;

//         results.push({ 
//             partitions: numPartitions, 
//             time: totalTime,
//             averageReliability,
//             burstFrequency,
//             burstPercentage
//         });
        
//         console.log(`Partitions: ${numPartitions}, Time: ${totalTime.toFixed(3)}, Avg Reliability: ${averageReliability.toFixed(3)}, Burst Freq: ${burstFrequency.toFixed(3)}/s, Burst %: ${burstPercentage.toFixed(2)}%`);
//     }
//     return results;
// }

// console.log("Testing with 67% base reliability");
// const results67 = testingPowers(0.67);

// console.log("\nTesting with 34% base reliability");
// const results34 = testingPowers(0.34);

// console.log("\nTesting with 1% base reliability");
// const results01 = testingPowers(0.01);