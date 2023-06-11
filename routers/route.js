// Objetos de rotas
const express = require('express');
const route = express.Router();
module.exports = route;

// Controladores de acesso
const { ROLES } = require('../config/roles');
const checkAuth = require('../middlewares/checkAuth');
const checkPermission = require('../middlewares/checkPermission');

// Controladores das rotas
const controllerPessoa = require('../controllers/controllerPessoa');
const controllerProjeto = require('../controllers/controllerProjeto');

//Rotas pessoas
    route.get("/api/pessoas", checkAuth, checkPermission([ROLES.ADMIN]), controllerPessoa.getPessoas);
    route.get("/api/pessoa/:id", checkAuth, checkPermission([ROLES.ADMIN]), controllerPessoa.getPessoaById);   
    route.post("/api/cadastrarPessoa", checkAuth, checkPermission([ROLES.ADMIN]), controllerPessoa.postPessoa);
    route.put("/api/editarPessoa/:id", checkAuth, checkPermission([ROLES.ADMIN]), controllerPessoa.putPessoa);
    route.delete("/api/deletarPessoa/:id", checkAuth, checkPermission([ROLES.ADMIN]), controllerPessoa.deletePessoa);

//Rotas de projetos
    route.get("/api/projetos", controllerProjeto.getProjetos);
    route.get("/api/projeto/:id", checkAuth, checkPermission([ROLES.RESPONSAVEL]), controllerProjeto.getProjetoById);
    route.post("/api/cadastrarProjeto", checkAuth, checkPermission([ROLES.RESPONSAVEL]), controllerProjeto.postProjeto);
    route.put("/api/editarProjeto/:id", checkAuth, checkPermission([ROLES.RESPONSAVEL]), controllerProjeto.putProjeto);
    route.delete("/api/deletarProjeto/:id", checkAuth, checkPermission([ROLES.RESPONSAVEL]), controllerProjeto.deleteProjeto);

//Rotas de candidatos
    route.get("/api/candidatos", checkAuth, checkPermission([ROLES.ADMIN]), controllerPessoa.getCandidatos);
    route.get("/api/candidatosInteressados", checkAuth, checkPermission([ROLES.RESPONSAVEL]), controllerProjeto.getProjetosCandidaturas);
    route.post("/api/candidatar", checkAuth, checkPermission([ROLES.CANDIDATO]), controllerProjeto.postProjetoCandidato);
    route.delete("/api/removercandidatura/:idProjeto", checkAuth, checkPermission([ROLES.CANDIDATO]), controllerProjeto.deleteProjetoCandidato);
    route.post("/api/selecionaCandidato", checkAuth, checkPermission([ROLES.RESPONSAVEL]), controllerProjeto.postProjetoCandidatoSelecionar);
    route.get("/api/candidatosSelecionados/:idProjeto", controllerProjeto.getProjetoCandidatosSelecionados);