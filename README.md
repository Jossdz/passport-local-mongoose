<p align="center">
  <img alt="Ironhack" src="https://i.postimg.cc/JR7cMFqG/ironhack-miny.png" width="60" />
</p>
<h1 align="center">
  Passport-local-mongoose
</h1>

## Objetivos

Despues de esta lección serás capaz de:

* Aplicar un plugin de mongoose
* Agilizar el proceso de autenticación
* Aplicar conceptos de unidades anteriores pero concentrado en la funcionalidad.

## Introducción

Empezaremos un proyecto nuevo con irongenerate

```bash
irongenerate passport-lm
cd passport-lm
```

Y antes de comenzar con el código instalamos passport y sus dependencias:

```bash
  npm i passport passport-local passport-local-mongoose
```

así como también las herramientas que nos ayudarán con la sesión:

```bash
npm i connect-mongo express-session connect-ensure-login
```

## Creando nuestro modelo

Crea un archivo `/User.js` dentro de la carpeta `/models` con el siguiente contenido:

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// -> requerimos el plugin
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.Promise = global.Promise;

const userSchema = new Schema({
  username: String,
  password: String
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

// -> Tenemos un modelo común hasta ahora. Aplicamos el plugin al schema, y le asignamos un campo que usará como username.
userSchema.plugin(passportLocalMongoose, {usernameField: "username"});

const User = mongoose.model("User", userSchema);

module.exports = User;
```

## Configurando passport

Crea una carpeta `/services` con un archivo `passport.js` dentro y cópia el siguiente código:

```js
const passport = require('passport')
const localStrategy = require('passport-local').Strategy

const User = require('../models/User')

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport
```

Con el cual configuramos passport con la estrategia local y los métodos `serializeUser` y `deserializeUser`.

En nuestro archivo archivo `app.js` agregamos la configuración que acabamos de generar y colocamos los métodos de inicio y sesión de passport, así como la configuración de sesión:

```js
// no olvidemos importar passport, session y MongoStore
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)


app.use(require('express-session')({
  secret: 'plugin',
  resave: false,
  cookie: { maxAge: 60000 },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));

app.use(passport.initialize())
app.use(passport.session())
```

## Vistas

Para este apartado generaremos 3 archivos en la carpeta `/views/auth`:

* `login.hbs`:

```hbs
<h2>Login</h2>
<form action="/login" method="post">
<label for="username">username</label>
<input type="text" name="username" id="username">
<br>
<label for="password">password</label>
<input type="password" name="password" id="password"> 
<input type="submit">
</form>
```

* `signup.hbs`:

```hbs
<h2>Signup</h2>
<form action="/signup" method="post">
<label for="username">username</label>
<input type="text" name="username" id="username">
<br>
<label for="password">password</label>
<input type="password" name="password" id="password"> 
<input type="submit">
</form>
```

* `private.hbs`:

```hbs
<h2>Privada </h2>
<p>{{user.username}}</p>
```

> *y modifica el layout para tener una mejor navegación*

* `layout.hbs`:

```hbs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>{{title}}</title>
  <link rel="stylesheet" href="/stylesheets/style.css" />
</head>
<body>
  <nav>
    <ul id='navb'>
      <li>
        <a href="/">home</a>
      </li>
      <li>
        <a href="/login">login</a>
      </li>
      <li>
        <a href="/signup">signup</a>
      </li>
      <li>
        <a href="/logout">logout</a>
      </li>
      <li>
        <a href="/private">private</a>
      </li>
    </ulid>
  </nav>

  {{{body}}}

  <script src="/javascripts/script.js"></script>
</body>
</html>
```

> opcional: modificar el index.

* `index.hbs`

```hbs
<div class="entry">
  {{#if user}}
    <h1>welcome {{user.username}}</h1>
  {{else}}
    <p>please login or signup</p>
  {{/if}}
</div>
```

## Rutas

Generamos el archivo `/routes/auth.js` con el siguiente contenido:

```js
const ensureLogin = require('connect-ensure-login');
const passport = require('passport');
const {Router} = require('express');
const router = Router();

const User = require('../models/User');

router
  .get('/signup', (req, res, next)=>{
    res.render('auth/signup');
  })
  .post('/signup', (req, res, next)=>{
    User.register( new User({ username: req.body.username }),
    req.body.password,
    function(err, account){
      if(err){
        return res.json(err);
      }
      return res.redirect('/login')
    });
  })
  .get('/login', (req, res, next)=>{
    return res.render('auth/login');
  })
  .post('/login', passport.authenticate('local'), (req, res, next)=>{
    return res.redirect('/');
  })
  .get('/logout', (req, res, next)=>{
    req.logout();
    res.redirect('/login');
  })
  .get('/private', (req, res, next)=>{
    const user = req.user;
    if(user){
      return res.render('auth/private', {user: req.user});
    }
    return res.redirect("/login")
  })
  .get('/logout', (req, res, next)=>{
    req.logout();
    res.redirect('/login');
  })

module.exports = router;
```

Ahora abre el proyecto en [http://localhost:3000](http://localhost:3000), *asegurate de que tu servidor esté ejecutando.*

El resultado debería ser algo así:

![resultado_1](https://i.postimg.cc/8cyH4cQP/Captura-de-pantalla-2019-01-22-a-la-s-16-54-55.png)

## Estilos - *opcional*

Añade a `/public/stylesheets/style.scss` el siguiente código:

```css
#navb{
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: rebeccapurple;
  height: 60px;
  margin: 0;
}
#navb > li {
  list-style: none;
  color: white;
}
a{
  color: white;
  text-decoration: none;
}
a:visited{
  text-decoration: none;
  color: white;
}

```

El ejercicio al final debería verse así:

![styled](https://i.postimg.cc/B6w6Sf2w/Captura-de-pantalla-2019-01-22-a-la-s-19-16-21.png)