import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { arraysEqual } from '../utils';

export default function RegexCompare({
  texts,
  shouldNotMatchTexts = [],
  pattern = '',
  answerPattern = null,
  replaceText = null,
  replaceTextAnswer = null
}) {
  const inputFocusNotAllowedKeys = new Set([
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    ' ' // Space
  ]);
  const inputFocusDisableKeys = new Set(['Escape', 'Tab']);

  const [currentPattern, setCurrentPattern] = useState(pattern);
  const [currentReplaceText, setCurrentReplaceText] = useState(replaceText);
  const [replaceTexts, setReplaceTexts] = useState(texts);
  const [highlightedTexts, setHighlightedTexts] = useState(texts);
  const [
    shouldNotMatchHighlightedTexts,
    setShouldNotMatchHighlightedTexts
  ] = useState(shouldNotMatchTexts);

  const isReplaceEnabled = replaceText !== null;

  var [expectedReplaceContent, setExpectedReplaceContent] = useState([]);

  const isValidRegex = pattern => {
    try {
      new RegExp(pattern, 'g');
      return true;
    } catch (error) {
      return false;
    }
  };

  const getReplaceValue = (text, pattern, replaceText) =>
    isValidRegex(pattern)
      ? text.replace(new RegExp(pattern, 'g'), replaceText)
      : '';

  const isPatternMatchingText = (text, pattern) => {
    if (!isValidRegex(pattern)) {
      return [false, text];
    }
    var re = new RegExp(pattern, 'g');

    var match;
    var highlightedTextContent = [];
    var prevStartIndex = 0;
    var prevEndIndex = 0;
    var res = false;
    while (pattern.length > 0 && pattern !== '()' && (match = re.exec(text))) {
      if (match.index === re.lastIndex) {
        re.lastIndex++;
      }
      highlightedTextContent.push(text.substring(prevEndIndex, match.index));
      prevStartIndex = match.index;
      prevEndIndex = match.index + match[0].length;
      highlightedTextContent.push(
        <span
          key={`${prevStartIndex}-${prevEndIndex}-${match.index}`}
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
  const [correctReplaceText, setCorrectReplaceText] = useState(false);

  const updateUi = (pattern, currentReplaceText) => {
    var result = true;
    var newReplaceTexts = [];
    texts.forEach((text, i) => {
      const [isCorrectAnswer, highlightedTextContent] = isPatternMatchingText(
        text,
        pattern
      );
      var tempHighlightedTextContent = highlightedTexts;
      tempHighlightedTextContent[i] = highlightedTextContent;
      setHighlightedTexts(tempHighlightedTextContent);
      result = result && isCorrectAnswer;
      if (isReplaceEnabled) {
        newReplaceTexts.push(
          getReplaceValue(text, pattern, currentReplaceText)
        );
      }
    });
    if (isReplaceEnabled) {
      setReplaceTexts(newReplaceTexts);
      setCorrectReplaceText(
        currentPattern.length > 0 &&
          currentReplaceText.length > 0 &&
          arraysEqual(newReplaceTexts, expectedReplaceContent)
      );
    }
    shouldNotMatchTexts.forEach((text, i) => {
      const [isCorrectAnswer, highlightedTextContent] = isPatternMatchingText(
        text,
        pattern
      );
      var tempHighlightedTextContent = shouldNotMatchHighlightedTexts;
      tempHighlightedTextContent[i] = highlightedTextContent;
      setShouldNotMatchHighlightedTexts(tempHighlightedTextContent);
      result = result && !isCorrectAnswer;
    });
    setCorrectAnswer(result);
  };

  const calculateReplaceContent = (texts, pattern, replaceText) => {
    var results = [];
    texts.forEach(text =>
      results.push(getReplaceValue(text, pattern, replaceText))
    );
    return results;
  };

  useEffect(() => {
    setExpectedReplaceContent(
      calculateReplaceContent(texts, answerPattern, replaceTextAnswer)
    );
    updateUi(pattern, currentReplaceText);
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
    if (e.target.name === 'pattern') {
      setCurrentPattern(e.target.value);
      updateUi(e.target.value, currentReplaceText);
    } else {
      setCurrentReplaceText(e.target.value);
      updateUi(currentPattern, e.target.value);
    }
  };

  const hasUnmatchedTexts = shouldNotMatchHighlightedTexts.length > 0;
  return (
    <Wrapper>
      <div
        style={
          hasUnmatchedTexts
            ? { display: 'flex', justifyContent: 'space-around' }
            : {}
        }
      >
        <div>
          Match:
          <br />
          <ul>
            {highlightedTexts.map((ht, i) => (
              <li key={i}>
                {/* Using pre tag here, since markdown deletes extra spaces */}
                <Text>{ht}</Text>
              </li>
            ))}
          </ul>
        </div>
        {hasUnmatchedTexts && (
          <div>
            Do not match:
            <br />
            <ul>
              {shouldNotMatchHighlightedTexts.map((ht, i) => (
                <li key={i}>
                  {/* Using pre tag here, since markdown deletes extra spaces */}
                  <Text>{ht}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div
        style={
          hasUnmatchedTexts ? { display: 'flex', justifyContent: 'center' } : {}
        }
      >
        <Input
          type="text"
          name="pattern"
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          value={currentPattern}
          placeholder="Pattern"
        />
        {correctAnswer ? '✅' : '❌'}
        {
          <span
            onClick={() => {
              setCurrentPattern(pattern);
              updateUi(pattern, currentReplaceText);
            }}
            style={{ cursor: 'pointer', marginLeft: '20px' }}
          >
            🔄
          </span>
        }
        {answerPattern && (
          <span>
            &nbsp;
            <span
              onClick={() => {
                setCurrentPattern(answerPattern);
                updateUi(answerPattern, currentReplaceText);
              }}
              style={{ cursor: 'pointer' }}
            >
              ❓
            </span>
          </span>
        )}
      </div>
      {isReplaceEnabled && (
        <ReplaceDiv>
          <div
            style={
              hasUnmatchedTexts
                ? { display: 'flex', justifyContent: 'center' }
                : {}
            }
          >
            <Input
              type="text"
              name="replaceText"
              onKeyDown={handleKeyDown}
              onChange={handleChange}
              value={currentReplaceText}
              placeholder="Replace text"
            />
            {correctReplaceText ? '✅' : '❌'}
            {
              <span
                onClick={() => {
                  setCurrentReplaceText(replaceText);
                  updateUi(currentPattern, replaceText);
                }}
                style={{ cursor: 'pointer', marginLeft: '20px' }}
              >
                🔄
              </span>
            }
            {replaceTextAnswer && (
              <span>
                &nbsp;
                <span
                  onClick={() => {
                    setCurrentReplaceText(replaceTextAnswer);
                    updateUi(currentPattern, replaceTextAnswer);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  ❓
                </span>
              </span>
            )}
          </div>
          {currentPattern.length > 0 && currentReplaceText.length > 0 && (
            <div>
              <br />
              Replaced values:
              <br />
              <ul>
                {replaceTexts &&
                  replaceTexts.map((rt, i) => (
                    <li key={i}>
                      <Text>{rt}</Text>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </ReplaceDiv>
      )}
    </Wrapper>
  );
}

RegexCompare.propTypes = {
  texts: PropTypes.arrayOf(PropTypes.string).isRequired,
  shouldNotMatchTexts: PropTypes.arrayOf(PropTypes.string),
  pattern: PropTypes.string,
  answerPattern: PropTypes.string,
  replaceText: PropTypes.string,
  replaceTextAnswer: PropTypes.string
};

const Wrapper = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 5px;
  width: auto;
`;

const Input = styled.input`
  all: unset;
  color: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 3px;
  padding: 5px;
  min-width: 500px;
  margin-right: 16px;
`;

const Text = styled.pre`
  font-family: inherit;
  margin: auto;
`;

const ReplaceDiv = styled.div`
  margin-top: 20px;
`;
