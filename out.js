const figlet = require('figlet');
const chalk = require('chalk');

//Mensaje inicial 

/**
console.log(
	chalk.green.bold(
		figlet.textSync('CORE Quiz', {horizontalLayout: 'full'})
	)
);
*/

const colorize=(msg,color)=>{
        if(typeof color!=="undefined"){
		msg=chalk[color].bold(msg);
	}
        return msg;
};

const log = (socket, msg, color) => {
	socket.write(colorize(msg, color) + "\n");
};

//big log llama al log anterior
const biglog = (socket, msg, color) => {
	log(socket, figlet.textSync(msg, {horizontalLayout: 'full'}), color);
};

//MENSAJE DE ERROR
const errorlog = (socket, emsg) => {
	socket.write(`${colorize("error", "red")}:${colorize(colorize(emsg, "red"), "bgYellowBright")}\n`);
};

exports = module.exports = {
	colorize,
	log,
	biglog,
	errorlog
};