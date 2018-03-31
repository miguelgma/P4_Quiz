const Sequelize = require('sequelize');
const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false}); // para poder acceder a la base de datos objeto

// defino un modelo de datos con preguntas y respuestas con unica pregunta
sequelize.define('quiz',{

	question: {
		type: Sequelize.STRING,
		unique: {msg: "Ya existe esa pregunta"},
		validate: {notEmpty: {msg: "La pregunta no puede estar vacia"}}
	},
	answer: {
		type: Sequelize.STRING,
		validate: {notEmpty: {msg: "La respuesta no puede estar vacia"}}
	}
});

sequelize.sync()
//accede a la propiedad model y cuento cuantos hay promesa
.then(() => sequelize.models.quiz.count())
.then(count => {
	 if(!count){
	 	return sequelize.models.quiz.bulkCreate([
	 		{question: "Captial de Italia", answer: "Roma"},
	 		{question: "Capital de Francia", answer: "París"},
	 		{question: "Capital de España", answer: "Madrid"},
	 		{question: "Capital de Portugal", answer: "Lisboa"}
	 		

	 		]);
	 }
})
.catch(error =>{
	console.log(error);

});
module.exports = sequelize;