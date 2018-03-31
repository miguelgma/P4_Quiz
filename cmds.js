const {models} = require('./model');
const {colorize, log, biglog, errorlog} = require("./out");
const Sequelize = require('sequelize');

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
const validateId = id => {
	return new Sequelize.Promise((resolve, reject) =>{
		if(typeof id == "undefined") {
			reject(new Error(`Falta el parametro <id>`));
		} else {
			id = parseInt(id);
			if(Number.isNaN(id)) {
				reject(new Error(`Falta el parametro <id>`));				
			}else{
				resolve(id);
			}
		}
	});
};

const makeQuestion = (rl, text) =>{
	return new Sequelize.Promise((resolve, reject) => {
		rl.question(colorize(text, 'red'), answer => {
			resolve(answer.trim());
		});
	});
};

const listCmd = rl => {
	models.quiz.findAll()
	.then(quizzes => {
		quizzes.forEach(quiz => {
			log(`[${quiz.id}] ${quiz.question}`);
		});
	})
	.catch(error => {
		errolog(error.message);
	})
	.then(() => {
		rl.prompt();
	});	
};
const showCmd = (rl, id) => {
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error(`No esxiste un quiz asociado el id= ${id}`);
		}
		log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(()=> {
		rl.prompt();
	});
};

const addCmd = rl => {
	makeQuestion(rl, 'Introduzca una pregunta: ')
	.then(q => {
		return makeQuestion(rl, 'Introduzca una respuesta')
		.then(a => {
			return {question: q, answer: a};
		});	
	})
	.then(quiz => {
		return models.quiz.create(quiz);
	})
	.then((quiz) => {
		log(`${colorize('Se ha añadido','magenta')} ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer} `);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog('El quiz es erroneo');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
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
	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(error.message);
	})
	.then(()=> {
		rl.prompt();
	});
};

const editCmd = (rl, id) => {
	validateId(id)
	.then(id => models.quiz.findById(id))

	.then(quiz => {
		if(!quiz){
			throw new Error(`No esxiste un quiz asociado el id= ${id}`);
		}

		process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
		return makeQuestion(rl, 'Introduzca la pregunta ')
		.then(q => {
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
			return makeQuestion(rl, 'Introduzca la respuesta ')
			.then(a => {
				quiz.question = q;
				quiz.answer= a;
				return quiz;
			});
		});
	})
	.then(quiz => {
		return quiz.save();
	})
	.catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })

    .catch(error => {
        errorlog(error.message);
    })

    .then(() => {
        rl.prompt();
	});
};

// var x=0;
// var i=0;
// aux = new Array(model.getAll().length);

// const playCmd = rl => {
	
// 	if(i < model.getAll().length){
// 		var index = Math.floor(Math.random() * model.getAll().length);
// 		if(aux[index]== null){ 			
// 			aux[index]= index;
// 			const quiz= model.getByIndex(index);
// 			rl.question(colorize(`${quiz.question}: `), answer => {
// 				if(answer.toLowerCase().trim()==quiz.answer.toLowerCase().trim()){
// 					++x;
// 					console.log('Correcto');
// 					log(`${colorize('Lleva')} ${x} ${colorize('aciertos')}`);
					
// 					playCmd(rl);			
// 				}else{
// 					log('Incorrecto');
// 					log(`${colorize('Lleva')} ${x} ${colorize('aciertos')} `);
// 					console.log('Fin');
// 					rl.prompt();
// 				}	
// 			});
// 			i++;		
// 		}else{
// 			playCmd(rl);
// 		}		
// 	}else{
// 		i=0;
// 		x=0;
// 		aux.splice(0, model.getAll().length);
// 		console.log('Fin');
// 		rl.prompt();
// 	}

// }
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
	//playCmd,
	creditsCmd,
	quitCmd
};