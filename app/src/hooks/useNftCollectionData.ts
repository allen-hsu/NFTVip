import { useApp } from '@/context/app-context';
import { NftCollection } from '@/wrappers/NftCollection';
import { Address, OpenedContract } from '@ton/core';
import { useEffect, useState } from 'react';

export const useNftCollection = (collectionAddress: string) => {
    const { tonClient } = useApp();
    const [collection, setCollection] = useState<OpenedContract<NftCollection> | null>(null);
    useEffect(() => {
        if (tonClient == null) {
            return;
        }

        const address = Address.parse(collectionAddress);
        const nftCollection = tonClient.open(NftCollection.createFromAddress(address));
        setCollection(nftCollection);
        // nftCollection.getCollectionData().then((data) => {
        //     console.log(data);
        //     setCollectionData(data);
        // });
    }, [collectionAddress, tonClient]);

    return collection;
};
