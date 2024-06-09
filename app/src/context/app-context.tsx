import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { TonClient } from '@ton/ton';
import { TProduct } from '@/types/common-types.ts';
import { useTonClient } from '@/hooks/useTonClient.ts';
import { useNftCollection } from '@/hooks/useNftCollection';
import { useVip } from '@/hooks/useVip';
import { useTonConnect } from '@/hooks/useTonConnect';
import { NFT_COLLECTION_ADDRESS } from '@/constants/common-constants';

export type Product = TProduct;

export type Cart = Record<number, Product>;

type TAppProvider = {
    children: ReactNode;
};

type AppContextProviderValue = {
    cart: Cart;
    addProduct: (product: Product) => void;
    removeProduct: (product: Product) => void;
    setCart: (cart: Cart) => void;
    tonClient?: TonClient;
    isVipStatus: boolean;
    vipPoints: number;
    checkStatus: boolean;
};

const initialContext = {
    cart: {},
    addProduct: () => {},
    removeProduct: () => {},
    setCart: () => {},
    isVipStatus: false,
    vipPoints: 0,
    checkStatus: false,
};

const AppContext = createContext<AppContextProviderValue>(initialContext);
export const AppProvider = ({ children }: TAppProvider) => {
    const [cart, setCart] = useState<Cart>({});
    const { client } = useTonClient();
    const { walletAddress } = useTonConnect();
    const nftCollection = useNftCollection(NFT_COLLECTION_ADDRESS, client);
    const { isVipStatus, vipPoints, checkStatus } = useVip(nftCollection, walletAddress, client);

    const addProduct = useCallback((product: Product) => {
        setCart((previousState) => {
            if (!(product.id in previousState)) {
                return { ...previousState, [product.id]: { ...product, quantity: 1 } };
            }

            const previousQuantity = previousState[product.id].quantity;

            return {
                ...previousState,
                [product.id]: { ...product, quantity: previousQuantity + 1 },
            };
        });
    }, []);

    const removeProduct = useCallback((product: Product) => {
        setCart((previousState) => {
            if (!(product.id in previousState)) {
                return previousState;
            }

            const newQuantity = previousState[product.id].quantity - 1;

            if (newQuantity > 0) {
                return { ...previousState, [product.id]: { ...product, quantity: newQuantity } };
            }

            return Object.keys(previousState)
                .filter((key) => key !== String(product.id))
                .reduce(
                    (accumulator, key) => ({
                        ...accumulator,
                        [key]: previousState[Number(key)],
                    }),
                    {},
                );
        });
    }, []);

    return (
        <AppContext.Provider
            value={{ cart, setCart, addProduct, removeProduct, tonClient: client, isVipStatus, vipPoints, checkStatus }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
