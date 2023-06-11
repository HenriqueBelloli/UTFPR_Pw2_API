const Projeto = require('../models/projeto');
const ProjetoCandidatos = require('../models/projetoCandidatos');

module.exports = {

    async getProjetos(req, res) {
        const projetos = await Projeto.find();
        return res.status(200).json(projetos);
    },

    async getProjetoById(req, res) {
        try {
            const { id } = req.params;
            projeto = await Projeto.findById(id)

            if (projeto)
                return res.status(200).json(projeto);
            else
                return res.status(404).json();

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao consultar projeto' });
        }

    },

    async postProjeto(req, res) {

        try {
            const { nome, descricao, anoinicio, anofim, popularidade } = req.body;
            const responsavel = req.user.id;

            // Não permite definir a popularidade por esse meio
            if (popularidade) {
                return res.status(400).json({ error: 'Não é possível definir a popularidade' });
            }

            const projeto = new Projeto({ nome, descricao, anoinicio, anofim, responsavel });

            await projeto.save().then((projeto) => {
                return res.status(201).json(projeto);
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao cadastrar projeto' });
        }

    },

    async putProjeto(req, res) {

        try {
            const projeto = await Projeto.findById(req.params.id);
            const { nome, descricao, anoInicio, anoTermino, popularidade } = req.body;

            if (!projeto) {
                return res.status(404).json({ error: 'Projeto não encontrado.' });
            }

            // Verifica se o usuário é o responsável pelo projeto
            if (projeto.responsavel.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado. Você não é o responsável por este projeto' });
            }

            // Não permite atualizar a popularidade por esse meio
            if (popularidade) {
                return res.status(400).json({ error: 'Não é possível editar a popularidade dessa forma' });
            }

            // Atualiza os dados do projeto
            if (nome) {
                projeto.nome = nome;
            }

            if (descricao) {
                projeto.descricao = descricao;
            }

            if (anoInicio) {
                projeto.anoInicio = anoInicio;
            }

            if (anoTermino) {
                projeto.anoTermino = anoTermino;
            }

            // Salvar as alterações do projeto
            await projeto.save();

            return res.status(200).json(projeto);

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao editar projeto' });
        }

    },

    async deleteProjeto(req, res) {

        try {
            // Encontra o projeto
            const projeto = await Projeto.findById(req.params.id);

            if (!projeto) {
                return res.status(404).json({ error: 'Projeto não encontrado.' });
            }

            // Verifica se o usuário é o responsável pelo projeto
            if (projeto.responsavel.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado. Você não é o responsável por este projeto' });
            }

            // Verifica se existem candidatos ao projeto
            const candidatura = await ProjetoCandidatos.findOne({ projeto: projeto._id });
            if (candidatura) {
                return res.status(400).json({ error: 'Erro: Existem candidaturas ao projeto' });
            }

            // Excluir o projeto
            await projeto.remove();

            return res.sendStatus(204);

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao eliminar projeto' });
        }

    },

    async postProjetoCandidato(req, res) {
        try {
            const projetoId = req.body.projeto;
            if (!projetoId) {
                return res.status(400).json({ error: 'Projeto não informado' });
            }

            // Encontra o projeto
            const projeto = await Projeto.findById(projetoId);
            if (!projeto) {
                return res.status(404).json({ error: 'Projeto não encontrado.' });
            }

            // Verifica se já existe registro para o candidato ao projeto
            const candidatoId = req.user.id;
            const candidatoExistente = await ProjetoCandidatos.findOne({ projeto: projetoId, candidato: candidatoId });
            if (candidatoExistente) {
                return res.status(400).json({ error: 'Candidato já consta na lista de interessados' });
            }

            // Registra a candidatura e atualiza a popularidade do projeto
            const candidatura = new ProjetoCandidatos({
                projeto: projetoId,
                candidato: candidatoId
            });

            projeto.popularidade += 1;

            await candidatura.save();
            await projeto.save();

            return res.status(201).json({ message: 'Candidatura registrada com sucesso' });

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao registrar candidatura' });
        }
    },

    async deleteProjetoCandidato(req, res) {
        try {

            // Verifica se existe registro para o candidato ao projeto
            const candidatura = await ProjetoCandidatos.findOne({ projeto: req.params.idProjeto, candidato: req.user.id });
            if (!candidatura) {
                return res.status(404).json({ error: 'Candidatura não encontrada' });
            }

            // Atualiza a popularidade do projeto
            const projeto = await Projeto.findById(candidatura.projeto);
            if (!projeto) {
                return res.status(400).json({ error: 'Projeto não encontrado.' });
            }

            projeto.popularidade -= 1;

            await candidatura.remove();
            await projeto.save();

            return res.status(200).json({ message: 'Candidatura eliminada' });

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao eliminar candidatura' });
        }
    },

    async getProjetosCandidaturas(req, res) {

        try {
            // Carrega todos os projetos do responsável
            const projetos = await Projeto.find({ responsavel: req.user.id }).select('nome descricao');

            // Para cada projeto, carrega os candidatos interessados
            const objetoRetorno = await Promise.all(projetos.map(async projeto => {
                const interessados = await ProjetoCandidatos.find({ projeto: projeto._id }).populate('candidato', 'nome');
                return {
                    projeto: {
                        id: projeto._id,
                        nome: projeto.nome,
                        descricao: projeto.descricao
                    },
                    candidatos: interessados.map(interesse => ({
                        id: interesse.candidato._id,
                        nome: interesse.candidato.nome
                    }))
                };
            }));

            res.status(200).json(objetoRetorno);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Erro ao consultar candidatos selecionados do projeto' });
        }
    },

    async postProjetoCandidatoSelecionar(req, res) {
        try {
            const { projetoId, candidatoId } = req.body;
            const responsavel = req.user.id;

            if (!projetoId) {
                return res.status(400).json({ error: 'Projeto não informado' });
            }

            if (!candidatoId) {
                return res.status(400).json({ error: 'Candidato não informado' });
            }

            // Encontra o projeto
            const projeto = await Projeto.findById(projetoId);
            if (!projeto) {
                return res.status(404).json({ error: 'Projeto não encontrado.' });
            }

            // Verifica se o usuário é o responsável pelo projeto
            if (projeto.responsavel.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado. Você não é o responsável por este projeto' });
            }

            // Verifica se já existe registro para o candidato ao projeto
            const candidatura = await ProjetoCandidatos.findOne({ projeto: projetoId, candidato: candidatoId });
            if (!candidatura) {
                return res.status(400).json({ error: 'Candidato não encontrado para o projeto' });
            }

            // Atualiza o status do candidato
            candidatura.selecionado = true;

            await candidatura.save();

            return res.status(201).json({ message: 'Candidato selecionado com sucesso' });

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao registrar seleção de candidato' });
        }
    },

    async getProjetoCandidatosSelecionados(req, res) {
        try {
            const projetoId = req.params.idProjeto;

            // Encontra o projeto
            const projeto = await Projeto.findById(projetoId);
            if (!projeto) {
                return res.status(404).json({ error: 'Projeto não encontrado.' });
            }

            //Busca os candidatos selecionados
            const candidatosSelecionados = await ProjetoCandidatos.find({ projeto: projetoId, selecionado: true }).populate('candidato', 'nome')

            const objetoRetorno = {
                projeto: {
                    id: projeto._id,
                    descricao: projeto.descricao,
                    candidatosSelecionados: candidatosSelecionados.map(selecionados => ({
                        id: selecionados.candidato._id,
                        nome: selecionados.candidato.nome
                    }))
                }
            };

            res.status(200).json(objetoRetorno);

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao consultar candidatos selecionados do projeto' });
        }

    },
}