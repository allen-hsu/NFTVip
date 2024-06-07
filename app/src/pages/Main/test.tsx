import { useCallback } from 'react';
import { useTonAddress, useTonConnectModal } from '@tonconnect/ui-react';
import { useMainButton } from '@/hooks/useMainButton';
import Header from '@/components/Header';
import styles from './styles.module.scss';
import Button from '@/components/Button';
import { useApp } from '@/context/app-context';
import { NftCollection } from '@/wrappers/NftCollection';
// import { compile } from '@ton/blueprint';
import { buildCollectionContentCell } from '@/OnChain';
import { Address, Cell, toNano } from '@ton/core';
import { useTonConnect } from '@/hooks/useTonConnect';
import { hex as NftCollectionHex } from '@/assets/NftCollection.compiled.json';
import { hex as NftItemHex } from '@/assets/NftItem.compiled.json';

const Main = () => {
    const { tonClient } = useApp();
    const address = useTonAddress();
    const { open } = useTonConnectModal();
    const { sender, walletAddress } = useTonConnect();

    const handleDeployTonNft = useCallback(async () => {
        console.log('Deploying TON NFT');
        if (walletAddress === null || tonClient === null || tonClient === undefined) {
            return;
        }

        const nftCollectionCode = Cell.fromBoc(Buffer.from(NftCollectionHex, 'hex'))[0];
        const nftItemCode = Cell.fromBoc(Buffer.from(NftItemHex, 'hex'))[0];

        const nftCollection = tonClient.open(
            NftCollection.createFromConfig(
                {
                    ownerAddress: walletAddress,
                    nextItemIndex: 0,
                    collectionContent: buildCollectionContentCell({
                        name: 'OnChain collection',
                        description: 'Collection of items with onChain metadata',
                        image: 'https://raw.githubusercontent.com/Cosmodude/Nexton/main/Nexton_Logo.jpg',
                    }),
                    nftItemCode: nftItemCode,
                    royaltyParams: {
                        royaltyFactor: Math.floor(Math.random() * 500),
                        royaltyBase: 1000,
                        royaltyAddress: walletAddress,
                    },
                },
                nftCollectionCode,
            ),
        );

        // console.log('nftCollection', nftCollection.);

        // console.log('Counter address', nftCollection.address.toString());
        await nftCollection.sendDeploy(sender, toNano('0.05'));

        for (let i = 1; i <= 10; i++) {
            const isDeployed = await tonClient.isContractDeployed(nftCollection.address);
            if (isDeployed) {
                console.log('isDeployed', nftCollection.address.toString());
                return;
            }
            console.log('Waiting for deploy', i);
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }, [sender, tonClient, walletAddress]);

    const handleMintTonNftItem = useCallback(() => {
        console.log('Deploying TON NFT Mint');
    }, []);

    const handleConnectWallet = useCallback(() => {
        open();
    }, [open]);

    // const mainButton = useMainButton(
    //     address
    //         ? { text: 'View order', onClick: handleViewOrder }
    //         : { text: 'Connect wallet', onClick: handleConnectWallet },
    // );

    useMainButton({
        text: 'Connect wallet',
        onClick: handleConnectWallet,
        isVisible: address.length === 0,
    });

    return (
        <div className={styles.wrapper}>
            <Header />
            {!address ? (
                <div>Please Connect Wallet</div>
            ) : (
                <div>
                    <Button className={styles.button} onClick={handleDeployTonNft}>
                        Create The TON Premime
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Main;
