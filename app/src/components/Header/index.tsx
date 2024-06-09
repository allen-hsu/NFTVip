import { CHAIN, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DisconnectIcon, WalletIcon } from '@/constants/icons.tsx';

import { separateTonAddress } from '@/helpers/common-helpers.ts';
import styles from './styles.module.scss';
import { useTonConnect } from '@/hooks/useTonConnect.ts';
import { useNftCollection } from '@/hooks/useNftCollection';
import { useCallback, useState } from 'react';
import { Address, toNano } from '@ton/core';
import Button from '../Button';
import { setItemContentCell } from '@/OnChain';
import { useApp } from '@/context/app-context';
import { NFT_COLLECTION_ADDRESS } from '@/constants/common-constants';
import { TonClient } from '@ton/ton';

const randomSeed = Math.floor(Math.random() * 10000);
const Header = () => {
    const { tonClient, isVipStatus, vipPoints, checkStatus } = useApp();
    const address = useTonAddress();
    const [tonConnectUI] = useTonConnectUI();
    const { network, sender } = useTonConnect();
    const navigate = useNavigate();
    const location = useLocation();
    const nftCollection = useNftCollection(NFT_COLLECTION_ADDRESS, tonClient);
    const [loading, setLoading] = useState(false);

    const waitTxFinalized = useCallback(async (txlt: string, address: Address, tonClient: TonClient) => {
        for (let attempt = 0; attempt < 10; attempt++) {
            await sleep(2000);
            const result = await tonClient.getContractState(address);
            const lastLx = result.lastTransaction?.lt;
            if (lastLx !== txlt) {
                console.log(`Transaction ${txlt} finalized`);
                break;
            }
        }
    }, []);

    const sleep = (ms: number): Promise<void> => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };
    const mintVIP = useCallback(async () => {
        if (nftCollection === null || address === '' || tonClient === undefined) {
            return;
        }
        setLoading(true);
        try {
            const collectionData = await nftCollection.getCollectionData();
            await nftCollection.sendMintNft(sender, {
                value: toNano('0.04'),
                queryId: randomSeed,
                amount: toNano('0.014'),
                itemIndex: collectionData.nextItemId,
                itemOwnerAddress: Address.parse(address),
                itemContent: setItemContentCell({
                    name: 'VIP Item',
                    description: 'VIP Item',
                    image: 'https://i.imgur.com/QYiSfRi.jpeg',
                }),
            });

            const result = await tonClient.getContractState(NFT_COLLECTION_ADDRESS);
            const txLt = result.lastTransaction?.lt ?? '';
            console.log(`Last transaction: ${txLt}`);

            await waitTxFinalized(txLt, NFT_COLLECTION_ADDRESS, tonClient);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [address, nftCollection, sender, tonClient, waitTxFinalized]);

    return (
        address && (
            <div>
                <div className={styles.header}>
                    <div className={styles.address}>
                        Address: {separateTonAddress(address)}{' '}
                        {network === CHAIN.TESTNET && <span className={styles.label}>testnet</span>}
                    </div>
                    <div className={styles.controls}>
                        {location.pathname !== '/transactions-history' && (
                            <button onClick={() => navigate('/transactions-history')}>
                                <WalletIcon />
                            </button>
                        )}
                        <button onClick={() => tonConnectUI.disconnect()}>
                            <DisconnectIcon />
                        </button>
                    </div>
                </div>

                <div className={styles.header}>
                    <div>VIP: {checkStatus ? (isVipStatus ? 'Yes' : 'No') : 'Checking...'}</div>
                    {isVipStatus && <div>VIP Points: {checkStatus ? vipPoints : 'Checking...'}</div>}
                    {!isVipStatus && (
                        <div>
                            <Button onClick={mintVIP} disabled={loading || !checkStatus}>
                                {loading ? 'Minting...' : 'Become VIP'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};

export default Header;
