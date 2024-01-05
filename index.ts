const { MerkleTree } = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')


// this will be what is changed, sizes of leaves will be varied (partitions of the image)
const leaves = ['a', 'b', 'c'].map(x => SHA256(x))


const tree = new MerkleTree(leaves, SHA256)
const root = tree.getRoot().toString('hex')
const leaf = SHA256('a')
const proof = tree.getProof(leaf)
console.log(tree.verify(proof, leaf, root)) // true


const badLeaves = ['a', 'x', 'c'].map(x => SHA256(x))
const badTree = new MerkleTree(badLeaves, SHA256)
const badLeaf = SHA256('x')
const badProof = badTree.getProof(badLeaf)
console.log(badTree.verify(badProof, badLeaf, root)) // false