import { css } from '@emotion/react';

export const bodyRoot = css`
  background: white;
  user-select: none;
  img {
    max-width: 100%;
    height: auto;
  }
`;

export const jumbo = css`
  padding: 5% 10%;
  z-index: 2;
  position: relative;
  h1 {
    font-size: 2rem;
  }
  p {
    font-size: 1.2rem;
    color: #505050;
  }
  strong {
    color: #024ca7;
  }
`;

export default {
  bodyRoot,
};
