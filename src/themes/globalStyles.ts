import { createGlobalStyle } from "styled-components";

// interface ThemeType {
//   body: string;
//   text: string;
//   background: string;
// }

export const GlobalStyles = createGlobalStyle`
    body {
        background: #fff;
        color: ${({ theme }) => theme.text};
        transition: all 0.08s linear;
    }

    /* width */
    ::-webkit-scrollbar{
        width: 5px;
        /* background-color: ${({ theme }) => theme.darkGray}; */
        background-color:white;
        
    }
    ::-webkit-scrollbar-thumb{
        background-color: ${({ theme }) => theme.darkGray};
        border-radius: 50px;
        box-shadow:0px 0px 6px 2px rgba(0, 0, 0, 0.5) inset;
        /* cursor: pointer; */
    }
    ::-webkit-scrollbar-track {
        border-radius: 5px;
        background-color: ${({ theme }) => theme.lightGray};
        /* border: 1px solid #cacaca; */
    }

`;
