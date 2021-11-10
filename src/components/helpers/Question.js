import React from 'react';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Question = ({ question, answer }) => {
  const toggleAnswer = (e) => {
    let el = e.target.closest(".question");
    let answer = el.nextElementSibling;
    let plus = el.children[1].children[0]
    let minus = el.children[1].children[1]
    if (answer.style.display === "block") {
      answer.style.display = "none";
      plus.style.display = "block"
      minus.style.display = "none"
    } else {
      answer.style.display = "block";
      plus.style.display = "none"
      minus.style.display = "block"
    }
  }

  return (
    <div class="qa" >
        <div class="question" onClick={toggleAnswer} >
          <h3>{question}</h3>
          <div class="icon">
            <FontAwesomeIcon class="plus" icon={faPlus} />
            <FontAwesomeIcon class="minus" icon={faMinus} />
          </div>
        </div>
      <div class="answer">{answer}</div>
    </div>
  );
}

export default Question;