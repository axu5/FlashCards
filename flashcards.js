const fs = require("fs");
const path = require("path");
require("colors");

const { prompt } = require("./prompt");

const subjectsPath = path.join(__dirname, "data");
const subjects = fs.readdirSync(subjectsPath);

async function main() {
  console.clear();
  const subjectChoice = await getValidOption(subjects);
  console.clear();
  console.log(subjectChoice);

  const subjectChoicePath = path.join(subjectsPath, subjectChoice);
  const questionTopics = fs
    .readdirSync(subjectChoicePath)
    .filter(x => x.endsWith(".json"));

  const topicChoice = await getValidOption(
    questionTopics.map(x => x.replace(/\.[a-zA-Z0-9]*$/, ""))
  );

  const topicChoicePath = path.join(
    subjectChoicePath,
    topicChoice + ".json"
  );
  const topic = require(topicChoicePath);

  const shuffledTopics = shuffleArray(topic);

  let correct = 0;
  let total = 10;
  let incorrect = [];

  console.clear();
  for (let i = 0; i < total; ++i) {
    const questionTopic = shuffledTopics[i];
    const answer = await prompt(
      `[${i + 1}/${total}] `.gray + questionTopic.Q
    );
    console.clear();
    if (
      questionTopic.A.map(x => x.toLowerCase()).includes(
        answer.toLowerCase()
      )
    ) {
      // correct
      console.log("Correct!!".green);
      ++correct;
    } else {
      // incorrect
      incorrect.push({ questionTopic, answer });
      console.log("Incorrect D:".red);
      console.log(
        questionTopic.A.reduce((a, c) => `${c}\n${a}`.yellow, "")
      );
      console.log("Explanation:".white, questionTopic.EXP.green);
    }
  }

  console.clear();
  console.log(
    "You got",
    correct.toString().green,
    "questions correct out of",
    total.toString().green + " questions",
    `(${toSignificantFigure((correct / total) * 100, 3)}%)`.bgWhite
      .black
  );

  if (incorrect.length > 0) {
    console.log("Here are the questions you can improve on:".yellow);
    let i = 1;
    for (const inc of incorrect) {
      const { questionTopic: qt, answer } = inc;
      console.log();
      console.log(i++, qt.Q.white);
      console.log("You answered:", answer.red);
      console.log("Correct answer:", qt.A[0].green);
      console.log("| Explanation:", qt.EXP.yellow);
    }
  }

  console.log();
}

/**
 * @name toSignificantFigure
 * @description Return a number with a specific precision (of significant figure)
 *
 * @author axu5 (github.com/axu5)
 * @version 16.09.2021
 *
 * @param {Number} number number to be made precise
 * @param {Number} precision how many numbers there should be in the output
 *
 * @returns {Number} the number which has been floored
 */
function toSignificantFigure(number, precision) {
  if (precision < 0) {
    throw new Error("Precision has to be zero or more. (x>=0)");
  }

  /**
   * Example:
   * (inputs) -> (expected output)
   * 3.1415, 2 -> 3.14
   *
   * 3.1415 * 10^2 = 3.1415 * 100 = 314.15
   * 314.15 | 0 = 314.
   * 314. / 100 = 3.14 ✅
   */
  const tenToThePrec = Math.pow(10, precision);
  const choppedNumber = (number * tenToThePrec) | 0;
  const finalResult = choppedNumber / tenToThePrec;

  return finalResult;
}

/**
 * @description Creates a new array with the items from the array passed in the argument
 * Fisher-Yates Shuffle algorithm (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
 *
 * @author Axu5 (github.com/axu5)
 * @version 12.09.2021
 *
 * x@param {Array<any>} array array needed to shuffle
 * @returns {Array<any>} returns a new array
 */
function shuffleArray(array) {
  /**
   * Make a copy of the array so it isn't a reference
   * (es5 equivalent is arr = array.splice())
   */
  const arr = [...array];

  /**
   * 1. Loop over the array backwards and then
   * 2. Get a random previous item, that is
   *    no greater than the current index.
   * 3. Swap the current item with the random
   *    previous item to shuffle.
   */
  for (let i = arr.length - 1; i >= 0; i--) {
    const randomIndex = (Math.random() * i) | 0;
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }

  /**
   * Return the copy of the array.
   */
  return arr;
}

/**
 * @description Get user input from terminal
 *
 * @author Axu5 (github.com/axu5)
 * @version 12.09.2021
 *
 * @param {Array<string>} chooseArray
 * @returns {Promise<string>} option chosen by user
 */
async function getValidOption(chooseArray) {
  let i = 1;
  for (const value of chooseArray) {
    console.log(`| ${i++}) ${value}`);
  }

  const option = Number(await prompt(`(choose a number)`));
  if (isNaN(option)) {
    console.log("not a valid number");
    return getValidOption(chooseArray);
  } else if (option < 1 || option > subjects.length) {
    console.log("option out of range");
    return getValidOption(chooseArray);
  }

  return chooseArray[option - 1];
}

main();
