import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function RegexCompare({ texts, pattern }) {
  const inputFocusNotAllowedKeys = new Set([
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown'
  ]);
  const inputFocusDisableKeys = new Set(['Escape', 'Tab']);

  const [currentPattern, setCurrentPattern] = useState(pattern);
  const [highlightedTexts, setHighlightedTexts] = useState(texts);

  const isPatternMatchingText = (text, pattern) => {
    try {
      new RegExp(pattern, 'g');
    } catch (error) {
      return [false, text];
    }
    var re = new RegExp(pattern, 'g');

    var match;
    var highlightedTextContent = [];
    var prevStartIndex = 0;
    var prevEndIndex = 0;
    var res = false;
    while (pattern.length > 0 && pattern !== '()' && (match = re.exec(text))) {
      console.log(match);
      highlightedTextContent.push(text.substring(prevEndIndex, match.index));
      prevStartIndex = match.index;
      prevEndIndex = match.index + match[0].length;
      highlightedTextContent.push(
        <span
          key={match.index}
          style={{ background: '#18B70F', borderRadius: '3px' }}
        >
          {text.substring(prevStartIndex, prevEndIndex)}
        </span>
      );
      if (match[0] === text) {
        highlightedTextContent = [
          <span
            key={match.index}
            style={{ background: '#18B70F', borderRadius: '3px' }}
          >
            {text}
          </span>
        ];
        res = true;
        break;
      }
    }
    if (highlightedTextContent.length === 0) {
      highlightedTextContent.push(<span key={0}>{text}</span>);
    } else {
      highlightedTextContent.push(
        <span key={text.length}>
          {text.substring(prevEndIndex, text.length)}
        </span>
      );
    }
    return [res, highlightedTextContent];
  };

  const [correctAnswer, setCorrectAnswer] = useState(false);

  const UpdateUi = pattern => {
    var result = true;
    texts.forEach((text, i) => {
      const [isCorrectAnswer, highlightedTextContent] = isPatternMatchingText(
        text,
        pattern
      );
      var tempHighlightedTextContent = highlightedTexts;
      tempHighlightedTextContent[i] = highlightedTextContent;
      setHighlightedTexts(tempHighlightedTextContent);
      result = result && isCorrectAnswer;
    });
    setCorrectAnswer(result);
  };

  useEffect(() => {
    UpdateUi('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    UpdateUi(e.target.value);
  };

  return (
    <div>
      <span>
        Searching for:
        <br />
        <ul>
          {highlightedTexts.map((ht, i) => (
            <li key={i}>{ht}</li>
          ))}
        </ul>
      </span>
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
  texts: PropTypes.arrayOf(PropTypes.string).isRequired,
  pattern: PropTypes.string
};

const Input = styled.input`
  all: unset;
  color: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 3px;
  padding: 5px;
  margin-right: 16px;
`;
