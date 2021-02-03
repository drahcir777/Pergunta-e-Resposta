const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./database/database');
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");

// database
connection
  .authenticate()
  .then(() => {
    console.log("Conectou com o banco de dados")
  })
  .catch((error) => {
    console.log("Error: ", error);
  });

const app = express();

app.set("view engine", "ejs");
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  Pergunta.findAll({
    raw: true, order: [
      ['id', 'DESC']
    ]
  }).then(perguntas => {
    res.render("index", {
      perguntas
    })
  });
});

app.get("/perguntar", (req, res) => {
  res.render("perguntar");
})

app.post("/salvarpergunta", async (req, res) => {
  const { titulo, descricao } = req.body;
  let perguntas = await Pergunta.findOne({ where: { titulo } });
  if (!perguntas) {
    perguntas = await Pergunta.create({
      titulo,
      descricao
    })
    return res.redirect("/");
  }
  return res.json({ message: "Pergunta já cadastrada!" });
});

app.get("/pergunta/:id", async (req, res) => {
  const { id } = req.params
  const { corpo } = req.body;
  const perguntas = await Pergunta.findOne({
    where: {
      id
    }
  })
  if (perguntas != undefined) {

    var respostas = await Resposta.findAll({
      where: {
        perguntaId: perguntas.id
      },
      order: [['id', 'DESC']]
    })
    return res.render("pergunta", {
      perguntas,
      respostas
    });
  } else {
    return res.redirect("/")
  }
})

app.post("/responder", async (req, res) => {
  const { corpo, perguntaId } = req.body;

  const respostas = await Resposta.create({
    corpo,
    perguntaId
  });

  return res.redirect("/pergunta/" + perguntaId);
})

app.listen(3333, () => {
  console.log("Servidor Rodando");
})