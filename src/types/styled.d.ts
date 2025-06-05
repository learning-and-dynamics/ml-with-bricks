// src/styled.d.ts
import 'styled-components';

declare module 'styled-components' {
    // Extend the DefaultTheme interface
    export interface DefaultTheme {
        // Properties present in BOTH light and dark themes (potentially different values)
        text: string;
        textFieldText: string;
        boxShadow: string;
        complementaryColor: string;
        contrastColor: string;
        borderColor: string;
        markdownQuote: string;
        creatorsSwitcherActive: string;
        creatorsSwitcherUnActive: string;
        tierCardBorder: string;
        postDescriptionBlur: string;
        imagePlaceholder: string;

        // Properties ONLY in lightTheme (make optional)
        black?: string;
        white?: string;
        gray?: string;
        darkGray?: string;
        lightGray?: string;
        lightRed?: string;
        lightGreen?: string;
        red?: string;
        green?: string;
        darkRed?: string;
        darkGreen?: string;

        // Properties ONLY in darkTheme (make optional)
        bodyBackground?: string;
        grayText?: string;
        iconColor?: string;
        loaderBackground?: string;
        aboutPageAccent?: string;
        aboutPageHeader?: string;
    }
}