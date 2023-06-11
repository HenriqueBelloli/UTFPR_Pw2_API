const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const Pessoa = require('../models/pessoa');

const checkAuth = async (req, res, next) => {
  const authHeader  = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não informado/inválido' });
  }

  try {
    // Verificar e decodificar o token JWT
    const [, token] = authHeader.split(' ');
    const decodedToken = jwt.verify(token, JWT_SECRET);

    // Verificar se o ID pertence a uma pessoa cadastrada no banco de dados
    const pessoa = await Pessoa.findById(decodedToken.id);
    if (!pessoa) {
      return res.status(403).json({ error: 'Acesso não autorizado. Id inexistente' });
    }

    req.user = {
      id: decodedToken.id,
      roles: decodedToken.roles,
    };

    next();
  } catch (error) {
    res.status(403).json({ error: 'Acesso não autorizado' });
  }
};

module.exports = checkAuth;
