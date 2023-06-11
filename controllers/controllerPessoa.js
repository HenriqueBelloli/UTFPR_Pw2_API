const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const Pessoa = require('../models/pessoa');
const { ROLES } = require('../config/roles'); // Importe os papéis disponíveis

module.exports = {

    async getCandidatos(req, res) {
        const candidatos = await Pessoa.find({role: 'CANDIDATO'});
        return res.status(200).json(candidatos);
    },

    async getPessoas(req, res) {
        const pessoas = await Pessoa.find();
        return res.status(200).json(pessoas);
    },

    async getPessoaById(req, res) {
        try {
            const { id } = req.params;
            pessoa = await Pessoa.findById(id)

            if (pessoa)
                return res.status(200).json(pessoa);
            else
                return res.status(404).json();

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao consultar pessoa' });
        }

    },

    async postPessoa(req, res) {

        try {
            const { nome, idade, cpf, email, role } = req.body;

            if (role && !ROLES[role]) {
                return res.status(400).json({ error: 'Valor inválido para o campo role' });
              }

            const pessoa = new Pessoa({ nome, idade, cpf, email, role});

            await pessoa.save();

            // Gerar o token JWT com o ID da pessoa e os papéis necessários
            const token = jwt.sign(
                { id: pessoa._id, roles: pessoa.role },
                JWT_SECRET,
                { expiresIn: '900d' }
            );

            //return res.status(201).json(token);
            return res.status(201).json({ pessoa: pessoa.toObject(), token });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Erro ao cadastrar pessoa' });
        }

    },

    async putPessoa(req, res) {

        try {

            const pessoa = await Pessoa.findOneAndUpdate({ _id: { $in: req.params.id } }, req.body)
            if (!pessoa) {
                return res.status(404).json({ error: 'Pessoa não encontrada.' });
            }

            return res.status(200).json(pessoa);

        } catch (error) {
            res.status(500).json({ error: 'Erro ao editar pessoa' });
        }

    },

    async deletePessoa(req, res) {

        try {
            const pessoa = await Pessoa.findByIdAndDelete(req.params.id);

            if (!pessoa) {
                return res.status(404).json({ error: 'Pessoa não encontrada.' });
            }
            res.sendStatus(204);

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao eliminar pessoa' });
        }

    }

}
