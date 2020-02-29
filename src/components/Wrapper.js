import React from 'react';
import styled from 'styled-components';

export default function Wrapper({ children }) {
  return <DivStyle>{children}</DivStyle>;
}

const DivStyle = styled.div`
  max-width: 960px;
  min-width: 560px;
  padding: 20px;
  margin: auto;
`;
