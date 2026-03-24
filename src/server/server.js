const jsonServer = require('json-server');
const auth = require('json-server-auth');
const jwt = require('jsonwebtoken');
const server = jsonServer.create();
const router = jsonServer.router('./src/server/db.json');
const middlewares = jsonServer.defaults();

// Função para gerar string alfanumérica de 4 caracteres
const generateAlphanumericId = () => {
  const chars = '01234567890123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

server.db = router.db;
server.db._sm = process.env.JWT_SECRET;

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Middleware para interceptar a criação do usuário
server.use((req, res, next) => {
  const isRegister = req.method === 'POST'
    && (req.url === '/register' || req.url === '/users' || req.url === '/signup');
  
  if (isRegister) {
    let newId;
    let idExists = true;
    // Repete a operação enquanto o ID gerado já existir no db.json
    while (idExists) {
      newId = generateAlphanumericId();
      // Procura no array de usuários se o ID já está em uso
      const user = router.db.get('users').find({ id: newId }).value();
      if (!user) {
        idExists = false; // Sai do loop se o ID for único
      }
    }
    // Atribui o ID alfanumérico antes de passar para o json-server-auth
    req.body.id = newId;
  }
  next();
});

const rules = auth.rewriter({
  transactions: 660,
  loans: 660,
  users: 660
})

server.use(rules);
server.use(auth);

server.get('/users/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).send();

  const payload = jwt.decode(token);

  try {
    // Valida usando a sua SECRET personalizada    
    const user = router.db.get('users').find({ email: payload.email }).value();
    delete user.password;
    if (user) {
      // Retorna 204 para o Guard do Angular e injeta o payload no header se quiser
      return res.status(200).json(user);
    } else {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }
  } catch (err) {
    return res.status(500).send();
  }
});

server.get('/users/:id?', (req, res, next) => {
  const { id } = req.params;
  const { email } = req.query;
  let user;

  if (id) {
    // Busca por ID (/users/a1b2)
    user = router.db.get('users').find({ id }).value();
  } else if (email) {
    // Busca por Email (/users?email=abc@mail.com)
    user = router.db.get('users').find({ email }).value();
  } else {
    // Se não for nenhum dos dois (ex: apenas /users), segue o fluxo padrão
    return next();
  }

  if (user) {
    // Encontrou: 204 No Content
    delete user.password;
    return res.status(200).json(user);
  } else {
    // Não encontrou: 404 Not Found
    return res.status(404).jsonp({ error: "Usuário não encontrado" });
  }
});

server.use(router);

server.listen(3000, () => {
  console.log('JSON Server Auth rodando na porta 3000!');
});