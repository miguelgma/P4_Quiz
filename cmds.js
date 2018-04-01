const {models} = require('./model');
const {colorize, log, biglog, errorlog} = require("./out");
const Sequelize = require('sequelize');

exports.helpCmd = rl => {
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

exports.listCmd = rl => {
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
exports.showCmd = (rl, id) => {
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

exports.addCmd = rl => {
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

exports.testCmd = (rl, id) => {
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error(`No esxiste un quiz asociado el id= ${id}`);
		}
		return makeQuestion(rl, `${quiz.question}: `)
		.then(a => {
			if(a.toLowerCase().trim()== quiz.answer.toLowerCase()){
				log("Respuesta correcta");
			}else{
				log("Respuesta incorrecta");
			}
		});
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(()=> {
		rl.prompt();
	});
}

exports.deleteCmd = (rl, id) => {
	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(error.message);
	})
	.then(()=> {
		rl.prompt();
	});
};

exports.editCmd = (rl, id) => {
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



exports.playCmd = rl => {
	let puntos = 0;
    let aux = [];

    const oneQuestion = () => {
        return new Promise((resolve,reject) => {

            if(aux.length <=0){
                log("Ha ganado el juego");
                log(puntos);
                resolve();
                return;
            }
            let index = Math.floor(Math.random()*aux.length);
            let quiz = aux[index];
            aux.splice(index,1);

            makeQuestion(rl, `${quiz.question}: `)
                .then(a => {
                    if(a.toLowerCase().trim() === quiz.answer.toLowerCase()){
                        puntos++;
                        resolve(oneQuestion());
                    } else {
                        log("Respuesta Incorrecta");                        
                        resolve();
                    }
                })
        })
    }

    models.quiz.findAll({raw: true})
        .then(quizzes => {
            aux = quizzes;
        })
        .then(() => {
            return oneQuestion();
        })
        .catch(error => {
            log(error);
        })

        .then(() => {
            log(`${colorize('Lleva')} ${puntos} ${colorize('puntos')} `);
            rl.prompt();
		});
};
exports.creditsCmd = rl =>{
	log('Autor: MIGUEL');
	rl.prompt();
};

exports.quitCmd = rl => {
		console.log('Fin');
		rl.close();
		rl.prompt();
};
