import React from "react";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";
import remarkGfm from "remark-gfm";
import InTextLink from "../Links/InTextLink";
import MonospaceSpan from "../MonospaceSpan/MonospaceSpan";

// Define media queries for responsiveness
const breakpoints = {
  sm: "480px",
  md: "768px",
  lg: "1024px",
};

// Define the styled typography components
const H1 = styled.h1`
  font-family: var(--main-font);
  font-size: 48px; /* Increased from 32px */
  font-weight: 900;
  line-height: 1.2;
  margin: 50px 0 30px;
  text-transform: uppercase;

  @media (max-width: ${breakpoints.md}) {
    font-size: 40px; /* Increased from 28px */
  }

  @media (max-width: ${breakpoints.sm}) {
    font-size: 32px; /* Increased from 24px */
  }
`;

const H2 = styled.h2`
  font-family: var(--main-font);
  font-size: 40px; /* Increased from 28px */
  font-weight: 700;
  line-height: 1.3;
  margin: 16px 0;

  @media (max-width: ${breakpoints.md}) {
    font-size: 32px; /* Increased from 24px */
  }

  @media (max-width: ${breakpoints.sm}) {
    font-size: 28px; /* Increased from 20px */
  }
`;

const H3 = styled.h3`
  font-family: var(--main-font);
  font-size: 24px; /* Increased from 24px */
  font-weight: 700;
  line-height: 1.4;
  margin: 12px 0 0;

  @media (max-width: ${breakpoints.md}) {
    font-size: 28px; /* Increased from 20px */
  }

  @media (max-width: ${breakpoints.sm}) {
    font-size: 24px; /* Increased from 18px */
  }
`;

const Paragraph = styled.p<{ $bold?: boolean }>`
  font-family: var(--main-font);
  font-size: 18px; /* Slightly increased from 16px */
  font-weight: ${({ $bold }) => (!!$bold ? 700 : 300)};
  line-height: 1.6;
  margin: 6px 0;
  word-wrap: break-word;

  @media (max-width: ${breakpoints.md}) {
    font-size: 16px; /* Increased from 14px */
  }

  @media (max-width: ${breakpoints.sm}) {
    font-size: 14px; /* Increased from 12px */
  }
`;

const customMarkdownComponents = {
  a: ({ node, ...props }: any) => (
    <InTextLink to={props.href}>{props.children}</InTextLink>
  ),
  p: ({ children }: any) => <>{children}</>,
  pre: ({ children }: any) => <>{children}</>,
  code: ({ children }: any) => <MonospaceSpan>{children}</MonospaceSpan>,
};

const Text = ({
  $bold,
  children,
  $markdown,
}: {
  $bold?: boolean;
  children: string | React.ReactNode;
  $markdown?: boolean;
}) =>
  !!$markdown ? (
    <Paragraph $bold={$bold}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={customMarkdownComponents}
      >
        {children as string}
      </ReactMarkdown>
    </Paragraph>
  ) : (
    <Paragraph $bold={$bold}>{children}</Paragraph>
  );

const Li = ({
  children,
  $markdown,
}: {
  children: string | React.ReactNode;
  $markdown?: boolean;
}) =>
  !!$markdown ? (
    <li>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={customMarkdownComponents}
      >
        {children as string}
      </ReactMarkdown>
    </li>
  ) : (
    <li>{children}</li>
  );

// Export the typography components
const Typography = { H1, H2, H3, Text, Li };
export default Typography;
