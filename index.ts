const { MerkleTree } = require("merkletreejs");
const SHA256 = require("crypto-js/sha256");

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

    return partitions;
}

function main() {
    // this will be what is changed, sizes of leaves will be varied (partitions of the image)
    const bs64_tides = require("fs").readFileSync("base64_tides.txt", "utf8");
    console.log(bs64_tides.length);
    // const leaves = ['a', 'b', 'c', 'd', 'e', 'f'].map(x => SHA256(x))
    const partitions = partitionString(bs64_tides, 64)

    console.log(partitions, partitions.length)

    const start = performance.now();
    const tree = new MerkleTree(partitions, SHA256);
    const end = performance.now();
    const root = tree.getRoot().toString("hex");
    console.log(end-start)
    // const leaf = SHA256("a");
    // const proof = tree.getProof(leaf);

    // console.log(tree.verify(proof, leaf, root), root, proof, "q");

    // console.log(root, "2");
}

main()