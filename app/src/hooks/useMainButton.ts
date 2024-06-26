import { useMainButton as useMainButtonComponent } from '@tma.js/sdk-react';
import { useEffect } from 'react';

type Props = {
    text: string;
    onClick: () => void;
    isEnabled?: boolean;
    isVisible?: boolean;
};

export const useMainButton = ({ text, onClick, isEnabled = true, isVisible = true }: Props) => {
    const mainButton = useMainButtonComponent();

    useEffect(() => {
        mainButton.on('click', onClick);
        mainButton.setParams({
            isEnabled,
            isVisible,
            text: text.toUpperCase(),
            bgColor: '#0098EA',
            textColor: '#ffffff',
        });

        return () => {
            mainButton.off('click', onClick);
        };
    }, [isEnabled, text, onClick, mainButton, isVisible]);

    return mainButton;
};
