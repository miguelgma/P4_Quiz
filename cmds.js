const model = require('./model');
const {colorize, log, biglog, errorlog} = require("./out");

const helpCmd = rl => {
	log("Comandos :");
	log("h|help - muestra esta ayuda");
	log("list - listar quizzes existentes");
	log("show <id> - Muestra pregunta y respuesta del quiz indicado");
	log("delete <id> - Borra el quiz indicado");
	log("edit <id> - Edita el quiz indicado");
	log("test <id> - Prueba el quiz indicado");
	log("p|play Jugar a preguntar todos los quizzes");
	log("credits - Creditos");
	log("q|quit - Salir del programa");
	rl.prompt();
};

const listCmd = rl => {
	model.getAll().forEach((quiz, id) =>{
		log(`[${id}] ${quiz.question}`);
	});
	rl.prompt();
};
const showCmd = (rl, id) => {
	if(typeof id == "undefined"){
		errorlog(`Falta parámetro id`);
	}else{
		try{
			const quiz = model.getByIndex(id);
			log(`[${id}]: ${quiz.question} => ${quiz.answer}`);
		}catch(error) {
			errorlog(error.message);
		}
	}
	rl.prompt();
};

const addCmd = rl => {
	rl.question(colorize('Introduzca una pregunta: ','red'), question => {
		rl.question(colorize('Introduzca una respuesta: ','red'), answer => {
			model.add(question, answer);
			log(`${colorize('Se ha añadido','magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
			rl.prompt();
		});
	});
};

const testCmd = (rl, id) => {
	if(typeof id == "undefined"){
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	}else{
		try{
			const quiz= model.getByIndex(id);
			rl.question(colorize(`${quiz.question}: `), answer => {
				if(answer==quiz.answer){
					console.log('Correcto');
					rl.prompt();
				}else{
					console.log('Incorrecto');
					rl.prompt();
				}
			});	
		}catch(error){
				errorlog(error.message);
				rl.prompt();
		}
	rl.prompt();	
	}
}

const deleteCmd = (rl, id) => {
	if(typeof id == "undefined"){
		errorlog(`Falta parámetro id`);
	}else{
		try{
			model.deleteByIndex(id);
		}catch(error) {
			errorlog(error.message);
		}
	}
	rl.prompt();
};

const editCmd = (rl, id) => {
	if(typeof id == "undefined"){
		errorlog(`Falta el par id.`);
		rl.prompt();
	}else{
		try{
			const quiz= model.getByIndex(id);

			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);

			rl.question(colorize('Introduzca una pregunta: ','red'), question => {

				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);

				rl.question(colorize('Introduzca una respuesta: ','red'), answer => {
					model.update(id, question, answer);
					log(`${colorize('Se ha cambiado el quiz: ','magenta')} ${colorize(id, 'magenta')} ${colorize('por','magenta')} ${colorize(question, 'magenta')}`);
					rl.prompt();
				});
			});		
		}catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}
};

var x=0;
var i=0;

const playCmd = rl => {

	if(i < model.getAll().length){
		const quiz= model.getByIndex(i);
		rl.question(colorize(`${quiz.question}: `), answer => {
			if(answer==quiz.answer){
				++x;
				console.log('Correcto');
				log(`${colorize('Lleva')} ${x} ${colorize('aciertos')}`);
				playCmd(rl);			
			}else{
				console.log('Incorrecto');
				//log(`${colorize('Lleva')} ${x} ${colorize('aciertos')} `);
				console.log('Fin');
				rl.prompt();
			}	
		});
		i++;	
	}else{
		i=0;
		x=0;
		console.log('Fin');
		rl.prompt();
	}

}
const creditsCmd = rl =>{
	log('Autor: MIGUEL');
	rl.prompt();
};

const quitCmd = rl => {
		console.log('Fin');
		rl.close();
		rl.prompt();
};

exports = module.exports = {
	helpCmd,
	listCmd,
	showCmd,
	addCmd,
	testCmd,
	deleteCmd,
	editCmd,
	playCmd,
	creditsCmd,
	quitCmd
};