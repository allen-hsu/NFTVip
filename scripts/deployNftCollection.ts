import { Address, Cell, toNano } from '@ton/core';
import { NftCollection } from '../wrappers/NftCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { buildCollectionContentCell, setItemContentCell } from './nftContent/onChain';

const randomSeed = Math.floor(Math.random() * 10000);

// Deploys collection and mints one item to the address of the
export async function run(provider: NetworkProvider) {
    const nftCollection = provider.open(
        NftCollection.createFromConfig(
            {
                ownerAddress: provider.sender().address!!,
                nextItemIndex: 0n,
                collectionContent: buildCollectionContentCell({
                    name: 'VIP Collection',
                    description: 'VIP Collection',
                    image: 'https://i.imgur.com/QYiSfRi.jpeg',
                }),
                nftItemCode: await compile('NftItem'),
                royaltyParams: {
                    royaltyFactor: Math.floor(Math.random() * 500),
                    royaltyBase: 1000,
                    royaltyAddress: provider.sender().address as Address,
                },
            },
            await compile('NftCollection'),
        ),
    );

    await nftCollection.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(nftCollection.address);

    const mint = await nftCollection.sendMintNft(provider.sender(), {
        value: toNano('0.04'),
        queryId: randomSeed,
        amount: toNano('0.014'),
        itemIndex: 0n,
        itemOwnerAddress: provider.sender().address!!,
        itemContent: setItemContentCell({
            name: 'VIP Item',
            description: 'VIP Item',
            image: 'https://i.imgur.com/QYiSfRi.jpeg',
        }),
    });
    console.log(`NFT Item deployed at https://testnet.tonviewer.com/${nftCollection.address}`);
}
