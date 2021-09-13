const readline = require('readline');

/**
 * @author Axu5 (github.com/axu5)
 * @version September-12-2021
 * @param prompt {string} the text that will be displayed in the terminal
 * @returns {Promise<string>} the text the user has answered with
 */
const prompt = prompt => new Promise(res => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(`| ${prompt} > `, answer => {
    rl.close();

    res(answer);
  });
});

const promptChoice = options => new Promise(res => {
  const stdin = process.stdin;

  // without this, we would only get streams once enter is pressed
  stdin.setRawMode( true );

  // resume stdin in the parent process (node app won't quit all by itself
  // unless an error or process.exit() happens)
  stdin.resume();

  // i don't want binary, do you?
  stdin.setEncoding( 'utf8' );

  // on any data into stdin
  stdin.on( 'data', function( key ){
    const keyInput = key.toString("utf-8");

    // ctrl-c ( end of text )
    if ( keyInput === '\u0003' ) {
      process.exit();
    }
    // write the key to stdout all normal like
    process.stdout.write( key );
  });
});

module.exports = {
  prompt,
}