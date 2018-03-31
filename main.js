const readline = require('readline');

const model = require("./model");

const {log, biglog, errorlog, colorize} = require("./out");

const cmds = require("./cmds");

biglog('CORE quiz','green');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: colorize("quiz >", "blue"),
  completer: (line) => {
	  const completions = 'h help add show delete edit list test p play credits q quit'.split(' ');
	  const hits = completions.filter((c) => c.startsWith(line));
	  // show all completions if none found
	  return [hits.length ? hits : completions, line];
  }

});

rl.prompt();

rl.on('line', (line) => {

	let args = line.split(" ");
	let cmd = args[0].toLowerCase().trim();
//line.trim()

  switch (cmd) {
  	case '':
  	    rl.prompt();
  		break;

  	case 'h':
  	case 'help':
  		cmds.helpCmd(rl);
		break;

	case 'list':
		cmds.listCmd(rl);
		break;

	case 'show':
		cmds.showCmd(rl, args[1]);
		break;

	case 'add':
		cmds.addCmd(rl);
		break;	

	case 'edit':
  		cmds.editCmd(rl, args[1]);
		break;

	case 'delete':
		cmds.deleteCmd(rl, args[1]);
		break;

	case 'test':
  		cmds.testCmd(rl, args[1]);
		break;

	case 'credits':
		cmds.creditsCmd(rl);
		break;

	// case 'play':
	// case 'p':
	// 	playCmd(rl);
	// 	break;

    case 'q':
    case 'quit':
    	cmds.quitCmd(rl);
    	break;

    default:
		log(`Comando desconocido: '${colorize(cmd, 'red')}'`);
		log(`Use ${colorize('help', 'green')} para ver comandos'`);
		rl.prompt();
    	break;
  }


}).on('close', () => {
  console.log('Fin');
  process.exit(0);
});

//Aqui iban antes las funciones de manejar el array de preguntas y respuestas
