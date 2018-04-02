const readline = require('readline');

const model = require("./model");

const {log, biglog, errorlog, colorize} = require("./out");

const cmds = require("./cmds");


const net = require("net");

net.createServer(socket => {
	log(socket, "Se ha conectado un cliente desde" + socket.remoteAddres);
	biglog(socket, 'CORE quiz','green');
	const rl = readline.createInterface({
	  	input: socket,
	  	output: socket,
	 	prompt: colorize("quiz >", "blue"),
	  	completer: (line) => {
			const completions = 'h help add show delete edit list test p play credits q quit'.split(' ');
		  	const hits = completions.filter((c) => c.startsWith(line));
			  // show all completions if none found
		  	return [hits.length ? hits : completions, line];
 		}
	});
	socket
	.on("end", () => {rl.close();})
	.on("error", () => {rl.close();});
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
  		cmds.helpCmd(socket, rl);
		break;

	case 'list':
		cmds.listCmd(socket,rl);
		break;

	case 'show':
		cmds.showCmd(socket,rl, args[1]);
		break;

	case 'add':
		cmds.addCmd(socket,rl);
		break;	

	case 'edit':
  		cmds.editCmd(socket,rl, args[1]);
		break;

	case 'delete':
		cmds.deleteCmd(socket,rl, args[1]);
		break;

	case 'test':
  		cmds.testCmd(socket,rl, args[1]);
		break;

	case 'credits':
		cmds.creditsCmd(socket,rl);
		break;

	case 'play':
	case 'p':
		cmds.playCmd(socket,rl);
		break;

    case 'q':
    case 'quit':
    	cmds.quitCmd(socket,rl);
    	break;

    default:
		log(socket,`Comando desconocido: '${colorize(cmd, 'red')}'`);
		log(socket,`Use ${colorize('help', 'green')} para ver comandos'`);
		rl.prompt();
    	break;
  }


	}).on('close', () => {
	  log(socket,"Fin");
	  //process.exit(0);
	});
})
.listen(3030);


//Aqui iban antes las funciones de manejar el array de preguntas y respuestas
