// const { MerkleTree } = require("merkletreejs");
// const SHA256 = require("crypto-js/sha256");
// let simulatedTime: any = 0;
// const unreliability = 0.66;
// const charSim = 3 * Math.pow(10, -3)

// // with this many characters, 333k, the file being transferred is 333kb
// // however, to scale this as some more understandable standards e.g a 1tb file at 1gb/s which would perfectly take 1000s to transfer
// // to scale the file, multiply by 3x10^6, what does this mean for time and speed though?
// // the speed stays constant however we can calculate an amount of time we should increment when simulating data transfer
// // e.g, (blocksize*3x10^6)/t = 1x10^9
// // (blocksize*3x10^6)/10^9 = t, thus for a given block size, we can multiply it by 3*10^-3.

// // this will be what is changed, sizes of leaves will be varied (partitions of the image)
// const bs64_tides = require("fs").readFileSync("base64_tides.txt", "utf8");
// // const bs64_tides = require("fs").readFileSync("chasetalk.mov", "utf8");
// // console.log(bs64_tides.length, 'q')
// // const bs64_vid = require("fs").readFileSync("chasetalk.mov", "utf8");
// // console.log('1221')
// // console.log(bs64_vid, '2302390u3902')
// // custom hashing based on network unreliability, e.g hash original file 33% of the time

// // function mimicNetworkUnreliability(file: any) {
// //   let unreliability = 0.66,
// //     random = Math.random(),
// //     final;

// //   while (random > unreliability) {
// //     final = SHA256(file); // hashing each time to mimic, increasing overall time
// //     random = Math.random();
// //     // console.log("fail");
// //   }

// //   final = SHA256(file);

// //   return final;
// // }
// function mimicNetworkUnreliability(file: any) {
//   let random = Math.random();
//   let final;

//   if (random < unreliability) {
//     // simply make corruption as impossible hash
//     final = file.substr(0, file.length - 1);
//   } else {
//     final = file;
//   }
//   return final;
// }

// // make partitions
// function partitionString(string: any, numPartitions: any) {
//   if (numPartitions <= 0) {
//     return ["Invalid number of partitions"];
//   }

//   const partitionSize = Math.ceil(string.length / numPartitions);
//   const partitions: any = [];

//   for (let i = 0; i < string.length; i += partitionSize) {
//     partitions.push(string.substring(i, i + partitionSize));
//   }

//   // Handling the case where the last partition might be smaller
//   if (partitions.length > numPartitions) {
//     partitions[partitions.length - 1] += partitions.pop();
//   }

//   // return partitions.map((x:any) => SHA256(x)), see issue 3
//   return partitions;
//   // .map((x: any) => mimicNetworkUnreliability(x));
// }

// // function main() {
// //   const partitions = partitionString(bs64_tides, 4096);

// //   console.log(partitions.length);

// //   const start = performance.now();
// //   const tree = new MerkleTree(partitions, SHA256);
// //   const root = tree.getRoot().toString("hex");
// //   const leaf = SHA256("a");
// //   const proof = tree.getProof(leaf);
// //   console.log(tree.verify(proof, leaf, root));
// //   const end = performance.now();
// //   console.log(end - start);
// //   // const leaf = SHA256("a");
// //   // const proof = tree.getProof(leaf);

// //   // console.log(tree.verify(proof, leaf, root), root, proof, "q");

// //   // console.log(root, "2");
// // }

// // main();

// // function findCorruptedLeaf(tree:any, workingTree:any, originalRoot:any) {
// //   let corruptLeaves:any = []
// //   const leaves = tree.getLeaves();
// //   const workingLeaves = workingTree.getLeaves();

// //   for (let i = 0; i < workingLeaves.length; i++) {
// //     const leaf = workingLeaves[i];
// //     // const workingProof = workingTree.getProof(leaf);
// //     const proof = tree.getProof(leaves[i])
// //     // simulatedTime += Number(JSON.stringify(workingProof).length/10)
// //     const isValidLeaf = tree.verify(proof, leaf, originalRoot);
// //     // delay here should be counting size of both proof and the block, add in below
// //     if (!isValidLeaf) {
// //       simulatedTime += Number(JSON.stringify(proof).length/10)
// //       let retry = mimicNetworkUnreliability(leaf)

// //       // console.log(isValidLeaf)
// //       // console.log(`Corrupted leaf found at index ${i}`);
// //       corruptLeaves.push(leaf)
// //       // console.log(leaf, '\n', leaves[i])
// //       // return leaf;
// //     }
// //   }
// //   console.log(corruptLeaves.length)
// //   return null;
// // }

// function requeryCorrupted(
//   tree: any,
//   workingTree: any,
//   corruptedPartitions: any,
//   originalRoot: any
// ) {
//   const leaves = tree.getLeaves();
//   const corrupted = corruptedPartitions;
//   let fails = 0;

//   for (let i = 0; i < corrupted.length; i++) {
//     const leaf = corrupted[i];
//     // const workingProof = workingTree.getProof(leaf);
//     const proof = tree.getProof(leaves[i]);
//     // simulatedTime += Number(JSON.stringify(workingProof).length/10)
//     const isValidLeaf = tree.verify(proof, leaf, originalRoot);
//     // delay here should be counting size of both proof and the block, add in below

//     if (!isValidLeaf) {
//       let random = Math.random();

//       while (random < unreliability) {
//         // console.log(new TextEncoder().encode(JSON.stringify(leaf)).length)

//         // console.log((corruptedPartitions), JSON.stringify(proof).length/10, '00')
//         // console.log(leaf, JSON.stringify(leaf).length)
//         // console.log(corruptedPartitions[i], corruptedPartitions[i].length, JSON.stringify(corruptedPartitions[i]).length)
//         simulatedTime += Number(
//           JSON.stringify(leaf).length*(charSim)
//           // + JSON.stringify(proof).length*(charSim)
//         );
//         random = Math.random();
//         fails += 1
//       }
//     } else {
//       corrupted[i] = leaves[i];
//     }
//   }
//   console.log(fails)
//   // console.log((JSON.stringify(corrupted[0]).length*(charSim)+ JSON.stringify(tree.getProof(leaves[0])).length*(charSim)).toFixed(2), 'time of 1 partition')
//   // console.log(fails, 'number of fails for', corrupted.length, 'partition')
//   const finalTree = new MerkleTree(corrupted, SHA256);
//   return finalTree.getRoot().toString("hex");
// }

// // issue arised, more partitions or smaller block size is always exponentially slower
// // probably because parititons are being hashed and thus when simulating calculating speed of data transfer, it is always more.

// function testingPowers() {
//   for (let i = 1; i <= 12; i++) {
//     const numPartitions = Math.pow(2, i);
//     // const numPartitions = 4096
//     const start = performance.now();
//     const partitions = partitionString(bs64_tides, numPartitions);
//     const tree = new MerkleTree(partitions, SHA256);

//     const corruptedPartitions = partitions.map((x: any) =>
//       mimicNetworkUnreliability(x)
//     );

//     const root = tree.getRoot().toString("hex");

//     const workingTree = new MerkleTree(corruptedPartitions, SHA256);
//     const workingRoot = workingTree.getRoot().toString("hex");

//     let finalRoot = requeryCorrupted(
//       tree,
//       workingTree,
//       corruptedPartitions,
//       root
//     );
//     const end = performance.now();

//     // if (root==workingRoot){ fix later
//     //   console.log("success!")
//     // }
//     // else {
//     //   console.log(root, finalRoot, 'fail')
//     // }
//     // console.log(end - start, 'setup');
//     // actual end-start time is mostly due to hashing/merkle reconstructing times and can therefore be 'controlled'
//     // console.log(simulatedTime);
//   }
// }

// testingPowers();

// // function testingLinear() {
// //   for (let i = 1; i <= 128; i++) {
// //     const numPartitions = i;
// //     // const numPartitions = 4096
// //     const partitions = partitionString(bs64_tides, numPartitions);
// //     const tree = new MerkleTree(partitions, SHA256);

// //     const corruptedPartitions = partitions.map((x: any) => mimicNetworkUnreliability(x));

// //     const root = tree.getRoot().toString("hex");

// //     const workingTree = new MerkleTree(corruptedPartitions, SHA256);
// //     const workingRoot = workingTree.getRoot().toString("hex");

// //     let finalRoot = requeryCorrupted(tree, workingTree, root)

// //     // if (root==workingRoot){ fix later
// //     //   console.log("success!")
// //     // }
// //     // else {
// //     //   console.log(root, finalRoot, 'fail')
// //     // }
// //     // console.log(end - start, workingRoot, root);
// //     // actual end-start time is mostly due to hashing/merkle reconstructing times and can therefore be 'controlled'
// //     console.log(simulatedTime)
// //   }
// // }

// // testingLinear();


const { MerkleTree } = require("merkletreejs");
const SHA256 = require("crypto-js/sha256");

let simulatedTime: number = 0;
const charSim = 3 * Math.pow(10, -3);
const bs64_tides = require("fs").readFileSync("base64_tides.txt", "utf8");

function mimicNetworkUnreliability(file: string, unreliability: number) {
  return Math.random() < unreliability ? file.substr(0, file.length - 1) : file;
}

function partitionString(string: string, numPartitions: number) {
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
  tree: any,
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
      while (Math.random() < unreliability && attempts < 5) {
        localTime += (leaf.length + JSON.stringify(proof).length) * charSim;
        attempts++;
      }
      if (attempts < 5) {
        corruptedPartitions[i] = leaves[i].toString();
      }
    }
  }
  
  const finalTree = new MerkleTree(corruptedPartitions, SHA256);
  return { root: finalTree.getRoot().toString("hex"), time: localTime };
}

function testingPowers(unreliability: number) {
  let results:any = [];
  for (let i = 1; i <= 12; i++) {
    const numPartitions = Math.pow(2, i);
    const partitions = partitionString(bs64_tides, numPartitions);
    const tree = new MerkleTree(partitions, SHA256);
    const corruptedPartitions = partitions.map(x => mimicNetworkUnreliability(x, unreliability));
    const root = tree.getRoot().toString("hex");
    
    const start = performance.now();
    const { root: finalRoot, time: localTime } = requeryCorrupted(tree, corruptedPartitions, root, unreliability);
    const end = performance.now();
    
    const totalTime = end - start + localTime;
    results.push({ partitions: numPartitions, time: totalTime });
    // console.log(`Partitions: ${numPartitions}, Time: ${totalTime}`);
    console.log(totalTime)
  }
  return results;
}

// Test with different unreliability levels
console.log("Testing with 33% unreliability");
const results33 = testingPowers(0.33);

console.log("\nTesting with 66% unreliability");
const results66 = testingPowers(0.66);

console.log("\nTesting with 99% unreliability");
const results99 = testingPowers(0.99);