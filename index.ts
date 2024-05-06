const { MerkleTree } = require("merkletreejs");
const SHA256 = require("crypto-js/sha256");
let simulatedTime:any = 0;
const unreliability = 0.33;

// this will be what is changed, sizes of leaves will be varied (partitions of the image)
const bs64_tides = require("fs").readFileSync("base64_tides.txt", "utf8");

// custom hashing based on network unreliability, e.g hash original file 33% of the time

// function mimicNetworkUnreliability(file: any) {
//   let unreliability = 0.66,
//     random = Math.random(),
//     final;

//   while (random > unreliability) {
//     final = SHA256(file); // hashing each time to mimic, increasing overall time
//     random = Math.random();
//     // console.log("fail");
//   }

//   final = SHA256(file);

//   return final;
// }
function mimicNetworkUnreliability(file: any) {
  let random = Math.random();
  let final;

  if (random < unreliability) {
    // simply make corruption as impossible hash
    final = SHA256("A")
  } else {
    final = file;
  }
  return final;
}

// make partitions
function partitionString(string: any, numPartitions: any) {
  if (numPartitions <= 0) {
    return ["Invalid number of partitions"];
  }

  const partitionSize = Math.ceil(string.length / numPartitions);
  const partitions: any = [];

  for (let i = 0; i < string.length; i += partitionSize) {
    partitions.push(string.substring(i, i + partitionSize));
  }

  // Handling the case where the last partition might be smaller
  if (partitions.length > numPartitions) {
    partitions[partitions.length - 1] += partitions.pop();
  }

  return partitions.map((x:any) => SHA256(x))
  // .map((x: any) => mimicNetworkUnreliability(x));
}

// function main() {
//   const partitions = partitionString(bs64_tides, 4096);

//   console.log(partitions.length);

//   const start = performance.now();
//   const tree = new MerkleTree(partitions, SHA256);
//   const root = tree.getRoot().toString("hex");
//   const leaf = SHA256("a");
//   const proof = tree.getProof(leaf);
//   console.log(tree.verify(proof, leaf, root));
//   const end = performance.now();
//   console.log(end - start);
//   // const leaf = SHA256("a");
//   // const proof = tree.getProof(leaf);

//   // console.log(tree.verify(proof, leaf, root), root, proof, "q");

//   // console.log(root, "2");
// }

// main();

function findCorruptedLeaf(tree:any, workingTree:any, originalRoot:any) {
  let corruptLeaves:any = []
  const leaves = tree.getLeaves();
  const workingLeaves = workingTree.getLeaves();

  for (let i = 0; i < workingLeaves.length; i++) {
    const leaf = workingLeaves[i];
    // const workingProof = workingTree.getProof(leaf);
    const proof = tree.getProof(leaves[i])
    // simulatedTime += Number(JSON.stringify(workingProof).length/10)
    const isValidLeaf = tree.verify(proof, leaf, originalRoot);
    // delay here should be counting size of both proof and the block, add in below
    if (!isValidLeaf) {
      simulatedTime += Number(JSON.stringify(proof).length/10)
      let retry = mimicNetworkUnreliability(leaf)

      // console.log(isValidLeaf)
      // console.log(`Corrupted leaf found at index ${i}`);
      corruptLeaves.push(leaf)
      // console.log(leaf, '\n', leaves[i])
      // return leaf;
    }
  }
  console.log(corruptLeaves.length)
  return null;
}



function requeryCorrupted(tree:any, workingTree:any, originalRoot:any) {
  let corruptLeaves:any = []
  const leaves = tree.getLeaves();
  const workingLeaves = workingTree.getLeaves();

  for (let i = 0; i < workingLeaves.length; i++) {
    const leaf = workingLeaves[i];
    // const workingProof = workingTree.getProof(leaf);
    const proof = tree.getProof(leaves[i])
    // simulatedTime += Number(JSON.stringify(workingProof).length/10)
    const isValidLeaf = tree.verify(proof, leaf, originalRoot);
    // delay here should be counting size of both proof and the block, add in below

    if (!isValidLeaf) {
      let random = Math.random();
    
      while (random < unreliability) {
        simulatedTime += Number((JSON.stringify(leaf).length/10)+JSON.stringify(proof).length/10)
        random = Math.random()
        console.log(random, 'jwe')
      }
    }
  }
  return null;
}

function testing() {
  // for (let i = 1; i <= 12; i++) {
    // const numPartitions = Math.pow(2, i);
    const numPartitions = 4096
    const partitions = partitionString(bs64_tides, numPartitions);
    const tree = new MerkleTree(partitions, SHA256);

    const start1 = performance.now();
    const corruptedPartitions = partitions.map((x: any) => mimicNetworkUnreliability(x));
    const end1 = performance.now();

    const root = tree.getRoot().toString("hex");

    const start = performance.now();
    
    const workingTree = new MerkleTree(corruptedPartitions, SHA256);
    const workingRoot = workingTree.getRoot().toString("hex");

    // while (root != workingRoot) {
      requeryCorrupted(tree, workingTree, root)
    // }

    const end = performance.now();

    console.log(end - start, workingRoot, root);
    console.log(simulatedTime)
  // }
}

testing();