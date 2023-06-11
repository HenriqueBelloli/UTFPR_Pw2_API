const checkPermission = (roles) => {
    return (req, res, next) => {
      const { user } = req;
  
      // Verifica se o usuário possui pelo menos uma das permissões necessárias
      const hasPermission = roles.some((role) => user.roles.includes(role));
  
      if (!hasPermission) {
        return res.status(403).json({ error: 'Acesso não autorizado. Perfil inválido ' });
      }
  
      next();
    };
  };
  
  module.exports = checkPermission;
  