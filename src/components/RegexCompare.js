import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function RegexCompare({ text, pattern, answer }) {
  const inputFocusNotAllowedKeys = new Set([
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown'
  ]);
  const inputFocusDisableKeys = new Set(['Escape', 'Tab']);

  const [currentPattern, setCurrentPattern] = useState(pattern);
  const isPatternMatchingText = (text, pattern) => {
    try {
      new RegExp(pattern, 'g');
    } catch (error) {
      return false;
    }
    const re = new RegExp(pattern, 'g');
    const matches = text.match(re);
    return matches && matches.find(r => r === text);
  };
  const [correctAnswer, setCorrectAnswer] = useState(
    isPatternMatchingText(text, pattern)
  );

  const handleKeyDown = e => {
    if (inputFocusDisableKeys.has(e.key)) {
      e.target.blur();
    } else if (inputFocusNotAllowedKeys.has(e.key)) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }
  };
  const handleChange = e => {
    setCurrentPattern(e.target.value);
    setCorrectAnswer(isPatternMatchingText(text, e.target.value));
  };
  return (
    <div>
      <p>Search Text: {text}</p>
      <Input
        type="text"
        name="pattern"
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        value={currentPattern}
        placeholder="pattern"
      />
      {correctAnswer ? '✅' : '❌'}
    </div>
  );
}

RegexCompare.propTypes = {
  text: PropTypes.string.isRequired,
  pattern: PropTypes.string,
  answer: PropTypes.string
};

const Input = styled.input`
  all: unset;
  color: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 3px;
  padding: 5px;
  margin-right: 16px;
`;
