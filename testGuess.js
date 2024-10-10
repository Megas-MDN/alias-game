(async () => {
    const leven = (await import('leven')).default;
  
    async function checkUserGuess(wordToGuess, userInput, threshold = 2) {
      const distance = leven(wordToGuess, userInput);
  
      if (wordToGuess.toLowerCase() === userInput.toLowerCase()) {
        console.log(`The word '${userInput}' is exactly the same as '${wordToGuess}'`);
        return 4;
      }
  
      if (distance <= threshold) {
        console.log(`The word '${userInput}' is considered similar to '${wordToGuess}' with a distance of ${distance}`);
        return 2;
      }
  
      console.log(`The word '${userInput}' is not similar enough to '${wordToGuess}'`);
      return 0;
    }
  
    async function runWordCheck() {
      const wordToGuess = "degree";  
      const userInput1 = "degree";   
      const userInput2 = "degre";    
      const userInput3 = "tree";
      const userInput4 = "derge"; 
      const userInput5 = "digrie";    
  
      const score1 = await checkUserGuess(wordToGuess, userInput1);
      console.log(`Score: ${score1}`); 
  
      const score2 = await checkUserGuess(wordToGuess, userInput2);
      console.log(`Score: ${score2}`);
  
      const score3 = await checkUserGuess(wordToGuess, userInput3);
      console.log(`Score: ${score3}`);

      const score4 = await checkUserGuess(wordToGuess, userInput4);
      console.log(`Score: ${score4}`);

      const score5 = await checkUserGuess(wordToGuess, userInput5);
      console.log(`Score: ${score5}`);
    }
  
    runWordCheck();
  })();

  ( async () => {

    const stringSimilarity = (await import('string-similarity')).default

    async function checkWordSimilarity(guessedWord, correctWord) {
        const similarity = stringSimilarity.compareTwoStrings(guessedWord, correctWord);
        const threshold = 0.5;  // 60% similarity
        return similarity >= threshold;
    }

    async function tryfunction() {
        const guessedWord = "degree";
        const correctWord = "degree";
        const incorrectWord = "tree";
        const correct = await checkWordSimilarity(guessedWord, correctWord);
        console.log("Correct guess for degree: ");
        console.log(correct);

        const incorrect = await checkWordSimilarity(incorrectWord, correctWord);
        console.log("Correct guess for tree: ");
        console.log(incorrect);
    }

    tryfunction();
    
  })();
  