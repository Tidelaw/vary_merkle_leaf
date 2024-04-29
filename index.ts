const { MerkleTree } = require("merkletreejs");
const SHA256 = require("crypto-js/sha256");

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
  const unreliability = 0.33;
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

function findCorruptedLeaf(tree:any, originalRoot:any) {
  const leaves = tree.getLeaves();

  for (let i = 0; i < leaves.length; i++) {
    const leaf = leaves[i];
    const proof = tree.getProof(leaf);
    const corrupted = tree.verify(proof, leaf, originalRoot);
    console.log(corrupted)
    // if (calculatedRoot.toString('hex') !== originalRoot) {
    //   console.log(`Corrupted leaf found at index ${i}`);
    //   return leaf;
    // }
  }

  console.log("No corrupted leaf found");
  return null;
}

function testing() {
  for (let i = 1; i <= 12; i++) {
    const numPartitions = Math.pow(2, i);
    const partitions = partitionString(bs64_tides, numPartitions);
    const tree = new MerkleTree(partitions, SHA256);

    const corruptedPartitions = partitions.map((x: any) => mimicNetworkUnreliability(x));
    const root = tree.getRoot().toString("hex");

    const start = performance.now();
    
    const workingTree = new MerkleTree(corruptedPartitions, SHA256);
    const workingRoot = workingTree.getRoot().toString("hex");

    // while (root != workingRoot) {
      findCorruptedLeaf(workingTree, root)
    // }

    const end = performance.now();

    console.log(end - start, workingRoot, root);
  }
}

testing();