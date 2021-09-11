import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import React, { FC, useCallback } from 'react';

const HELLO_WORLD_SEED = 'hello'
const programId = '3zbJNSBsB2JoQq3rq5b7CN3uaJSkJyUoiPGfAkNQZjy1'
const programKey = new PublicKey(programId)

export const CreateAccount : FC = () => {
    const { connection } = useConnection()
    const { publicKey, sendTransaction } = useWallet()

    const onClick = useCallback(async () => {

        if (publicKey == null) return

        const helloWorldPubKey = await PublicKey.createWithSeed(
            publicKey,
            HELLO_WORLD_SEED,
            programKey,
        )

        const lamports = await connection.getMinimumBalanceForRentExemption(0)

        const transaction = new Transaction().add(
            SystemProgram.createAccountWithSeed({
                fromPubkey: publicKey,
                basePubkey: publicKey,
                seed: HELLO_WORLD_SEED,
                newAccountPubkey: helloWorldPubKey,
                lamports,
                space: 0,
                programId: programKey,
            })
        )


        const signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction(signature, 'processed');

    }, [publicKey, sendTransaction, connection])


    return (
        <button onClick={onClick} disabled={!publicKey}>
            Create Account
        </button>
    )

}

export const SendOneLamportToRandomAddress: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        const helloWorldPubKey = await PublicKey.createWithSeed(
            publicKey,
            HELLO_WORLD_SEED,
            programKey,
        )

        const instruction = new TransactionInstruction({
            keys: [{
                pubkey: helloWorldPubKey,
                isSigner: false,
                isWritable: true,
            }],
            programId: programKey,
            data: Buffer.alloc(0),
        })

        const transaction = new Transaction().add(instruction)

        const signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction(signature, 'processed');
    }, [publicKey, sendTransaction, connection]);

    return (
        <button onClick={onClick} disabled={!publicKey}>
            Send 1 lamport to program
        </button>
    );
};

export const HelloWorldTest : FC = () => {
    return (
        <>
          <CreateAccount />
          <SendOneLamportToRandomAddress />
        </>
    )
}
