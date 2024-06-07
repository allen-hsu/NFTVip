import { CHAIN, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DisconnectIcon, WalletIcon } from '@/constants/icons.tsx';

import { separateTonAddress } from '@/helpers/common-helpers.ts';
import styles from './styles.module.scss';
import { useTonConnect } from '@/hooks/useTonConnect.ts';
import { useNftCollection } from '@/hooks/useNftCollectionData';
import { useCallback, useEffect, useState } from 'react';
import { toNano } from '@ton/core';
import Button from '../Button';

const NFT_COLLECTION_ADDRESS = 'EQCMoR0b5K65iItghLu3Ot_wdTj2jqLtUQVSUi9-3c2badIR';
const Header = () => {
    const address = useTonAddress();
    const [tonConnectUI] = useTonConnectUI();
    const { network } = useTonConnect();
    const navigate = useNavigate();
    const location = useLocation();
    const nftCollection = useNftCollection(NFT_COLLECTION_ADDRESS);
    const [isVipStatus, setIsVipStatus] = useState(false);

    const isVip = useCallback(async () => {
        if (nftCollection === null || address === '') {
            return false;
        }

        const collectionData = await nftCollection.getCollectionData();

        const nextIndex = collectionData.nextItemId;
        console.log(`Next item index: ${nextIndex}`);

        for (let i = 0; i < nextIndex; i++) {
            const itemAddress = await nftCollection.getItemAddressByIndex({
                type: 'int',
                value: toNano(i),
            });
            if (address === itemAddress.toString()) {
                return true;
            }
            console.log(`Item address: ${itemAddress.toString()}`);
        }
        return false;
    }, [address, nftCollection]);

    const mintVIP = useCallback(async () => {}, []);

    useEffect(() => {
        isVip()
            .then((vipStatus) => {
                setIsVipStatus(vipStatus);
            })
            .catch((error) => {
                setIsVipStatus(false);
            });
    }, [isVip]);

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
                    <div>VIP: {isVipStatus ? 'Yes' : 'No'}</div>
                    {!isVipStatus && (
                        <div>
                            <Button onClick={mintVIP}>Become VIP</Button>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};

export default Header;
