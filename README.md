run using `npx ts-node index.ts`

How can block sizes of a Merkle tree's hashed leaf nodes be optimised as a function of the unreliability of the channel in order to maximise speed in data verification?
<br>
<br>
## Research specific challenges 

1. Trying to find a shortcut by simulating hashes based on reliability, fundamentally wrong and doesn't utilize merkle trees

Misguided idea on what was being computed: shifting from calculating time taken to hash and constructing merkle trees to simulated time taken as a result of transfer of proofs and blocks based on size.

2. When trying to find the corrupted leaf, simply verifying the proof against the original root won't work as the simulated network unreliability affects more than just the current leaf being verified.

Solve by querying for the same block and proof each time if the block transferred does not verify correctly with the sent proof.

3. More partitions or smaller block size always leads to exponentially slower net speed

Probably because partitions are being hashed and thus when simulating calculating speed of data transfer, hash sizes are fixed and thus always result in a longer duration. The solution is to not map over the initial partitions with SHA256. 