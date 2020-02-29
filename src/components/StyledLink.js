import React from 'react';
import styled from 'styled-components';

export default function StyledLink({ link }) {
  return <LinkStyle href={link}>{link}</LinkStyle>;
}

const LinkStyle = styled.a`
  color: rgba(255, 255, 255, 0.9);
`;
