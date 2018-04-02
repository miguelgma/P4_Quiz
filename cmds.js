const {models} = require('./model');
const {colorize, log, biglog, errorlog} = require("./out");
const Sequelize = require('sequelize');

exports.helpCmd = (socket, rl) => {
	log(socket,"Comandos :");
	log(socket,"h|help - muestra esta ayuda");
	log(socket,"list - listar quizzes existentes");
	log(socket,"show <id> - Muestra pregunta y respuesta del quiz indicado");
	log(socket,"delete <id> - Borra el quiz indicado");
	log(socket,"edit <id> - Edita el quiz indicado");
	log(socket,"test <id> - Prueba el quiz indicado");
	log(socket,"p|play Jugar a preguntar todos los quizzes");
	log(socket,"credits - Creditos");
	log(socket,"q|quit - Salir del programa");
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

exports.listCmd = (socket, rl) => {
	models.quiz.findAll()
	.then(quizzes => {
		quizzes.forEach(quiz => {
			log(socket, `[${quiz.id}] ${quiz.question}`);
		});
	})
	.catch(error => {
		errolog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});	
};
exports.showCmd = (socket, rl, id) => {
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error(`No esxiste un quiz asociado el id= ${id}`);
		}
		log(socket, `[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(()=> {
		rl.prompt();
	});
};

exports.addCmd = (socket, rl) => {
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
		log(socket, `${colorize('Se ha añadido','magenta')} ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer} `);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket, 'El quiz es erroneo');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.testCmd = (socket, rl, id) => {
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error(`No esxiste un quiz asociado el id= ${id}`);
		}
		return makeQuestion(rl, `${quiz.question}: `)
		.then(a => {
			if(a.toLowerCase().trim()== quiz.answer.toLowerCase()){
				log(socket, "Respuesta correcta");
			}else{
				log(socket, "Respuesta incorrecta");
			}
		});
	})
	.catch(error => {
		errorlog(socket, serror.message);
	})
	.then(()=> {
		rl.prompt();
	});
}

exports.deleteCmd = (socket, rl, id) => {
	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(()=> {
		rl.prompt();
	});
};

exports.editCmd = (socket, rl, id) => {
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
            errorlog(socket, 'El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })

    .catch(error => {
        errorlog(socket, error.message);
    })

    .then(() => {
        rl.prompt();
	});
};



exports.playCmd = (socket,rl) => {
	let puntos = 0;
    let aux = [];

    const oneQuestion = () => {
        return new Promise((resolve,reject) => {

            if(aux.length <= 0){
                log(socket, "Ha ganado el juego");
                log(socket, puntos);
                resolve();
                return;
            }
            let index = Math.floor(Math.random()*aux.length);
            let quiz = aux[index];
            aux.splice(index,1);

            makeQuestion(rl, `${quiz.question}: `)
                .then(a => {
                    if(a.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
                        ++puntos;
                        resolve(oneQuestion());
                    } else {
                        log(socket, "Respuesta Incorrecta");                        
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
            log(socket,error);
        })

        .then(() => {
            log(socket, `${colorize('Lleva')} ${puntos} ${colorize('puntos')} `);
            log(socket, "Fin");
            rl.prompt();
		});
};
exports.creditsCmd = (socket,rl) =>{
	log(socket,'Autor: MIGUEL');
	rl.prompt();
};

exports.quitCmd = rl => {
		console.log(socket, 'Fin');
		rl.close();
		rl.prompt();
};
