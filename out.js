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

const colorize = (msg, color) => {
	if(typeof color !== "undefined"){
		msg= chalk[color].bold(msg);
	}
	return msg;
};

const log = (msg, color) => {
	console.log(colorize(msg, color));
};

//big log llama al log anterior
const biglog = (msg, color) => {
	log(figlet.textSync(msg, {horizontalLayout: 'full'}), color);
};

//MENSAJE DE ERROR
const errorlog = (emsg) => {
	console.log(`${colorize("error", "red")}:${colorize(colorize(emsg, "red"), "bgYellowBright")}`);
};

exports = module.exports = {
	colorize,
	log,
	biglog,
	errorlog
};