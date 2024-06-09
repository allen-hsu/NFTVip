import { NftCollection } from '@/wrappers/NftCollection';
import { NftItem } from '@/wrappers/NftItem';
import { Address, OpenedContract, toNano } from '@ton/core';
import { TonClient } from '@ton/ton';
import { useEffect, useRef, useState } from 'react';

export const useVip = (
    nftCollection: OpenedContract<NftCollection> | null,
    walletAddress: Address | null,
    tonClient: TonClient | undefined,
) => {
    const [isVipStatus, setIsVipStatus] = useState(false);
    const [vipPoints, setVipPoints] = useState(0);
    const [checkStatus, setCheckStatus] = useState(false);
    const isProcessing = useRef(false);

    useEffect(() => {
        const checkVip = async () => {
            if (nftCollection === null || walletAddress === null) {
                console.log('nftCollection or walletAddress is null');
                return;
            }
            console.log('walletAddress', walletAddress.toString());
            const collectionData = await nftCollection.getCollectionData();
            const nextIndex = collectionData.nextItemId;
            console.log(`Next item index: ${nextIndex}`);
            for (let i = 0; i < nextIndex; i++) {
                const itemAddress = await nftCollection.getItemAddressByIndex(i);
                console.log(`Item address: ${itemAddress.toString()}`);
                if (tonClient) {
                    const nftItem = tonClient.open(NftItem.createFromAddress(itemAddress));
                    const nftItemData = await nftItem.getNftData();
                    if (walletAddress.toString() === nftItemData.ownerAddress.toString()) {
                        console.log('checkStatus', true);
                        setIsVipStatus(true);
                        setVipPoints(nftItemData.pointValue);
                        break;
                    }
                }
            }
            setCheckStatus(true);
        };

        const tick = async () => {
            if (isProcessing.current) return;
            isProcessing.current = true;

            await checkVip();

            isProcessing.current = false;
        };

        const intervalId = setInterval(tick, 50 * 1000);
        tick();
        return () => {
            isProcessing.current = false;
            clearInterval(intervalId);
        };
    }, [nftCollection, tonClient, walletAddress]);

    return { isVipStatus, vipPoints, checkStatus };
};
