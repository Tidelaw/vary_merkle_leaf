run using `npx ts-node index.ts`

How can block sizes of a Merkle tree's hashed leaf nodes be optimised as a function of the unreliability of the channel in order to maximise speed in data verification?

An image will be used in order to mimic the file, its hashed partitions making up the merkle tree


# Research specific challenges 

1. Trying to find a shortcut by simulating hashes based on reliability, fundamentally wrong and doesn't utilize merkle trees

2. When trying to find the corrupted leaf, simply verifying the proof against the original root won't work as the simulated network unreliability affects more than just the current leaf being verified.