# Invoice App

A full stack invoice app in progress...

TODO:
look into validating HTTP response with zod, zod with mongoose or prisma etc.

https://www.youtube.com/watch?v=BWUi6BS9T5Y&ab_channel=TomDoesTech

Zod in express:
https://www.youtube.com/watch?v=ZvIbynFGwfc&ab_channel=LucasBarake

https://www.youtube.com/watch?v=1MT3mOsVxAo&ab_channel=TomDoesTech

TSconfig cheat sheet:https://www.totaltypescript.com/tsconfig-cheat-sheet
https://www.youtube.com/watch?v=eJXVEju3XLM&ab_channel=MattPocock

Rest API with Node Express, typescript, mongodb and authentication
https://www.youtube.com/watch?v=b8ZUb_Okxro&ab_channel=CodeWithAntonio

simple colour logging
https://muffinman.io/blog/nodejs-simple-colorful-logging/

express error handler (use isHttpError and then try/catch in route with createHttp error and next(error)) -- or use express-async-errors ?
https://www.youtube.com/shorts/hz8wxsj4f6Y

express request handler types
https://www.youtube.com/watch?v=CWWhjU73Q7A&ab_channel=CodinginFlow

ANSI excape sequences and colours
https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797

## error handling

flight diary backend

```
router.post('/', (req, res) => {
  try {
    const newDiaryEntry = toNewDiaryEntry(req.body);
    const addedEntry = diaryService.addDiary(newDiaryEntry);
    res.json(addedEntry);
  } catch (error: unknown) {
    let errorMessage = 'Something went wrong.';
    if (error instanceof Error) {
      errorMessage += ' Error: ' + error.message;
    }
    res.status(400).send(errorMessage);
  }
});
```

part 4: async/await - method is to when using promises with await instead of .then.catch(handle the error), we now have to do try/catch and send the error on with the next(error) function. Easiest method is to use express-async-errors, which eliminates the need for try/catch: an error is sent allong as next(error) automatically, just as it does with synchronous routes. (this is supposed to be implemented in upcoming express 5)

Bog app has error handler for catch CastErrors and sending response, or otherwise next(error) to send on to build in Express error handler for normal Error class errors:

```
const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: error.message });
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' });
  }

  next(error);
};
```

routes then handle some errors, however this is the sort of validation errors that will be handled in my zod request validator:

```
usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  if (username === undefined || password === undefined) {
    return response
      .status(400)
      .json({ error: 'missing username and/or password' });
  }

  if (username.length < 3) {
    return response
      .status(400)
      .json({ error: 'usename must be at least 3 characters long' });
  }

  if (password.length < 3) {
    return response
      .status(400)
      .json({ error: 'password must be at least 3 characters long' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const blog = new Blog(request.body);

  if (!blog.title || !blog.url) {
    return response.status(400).end();
  }

  if (!blog.likes) {
    blog.likes = 0;
  }

  const user = request.user;
  blog.user = user.id;

  const savedBlog = await blog.save();
  savedBlog.populate('user', { username: 1, name: 1 });

  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete(
  '/:id',
  middleware.userExtractor,
  async (request, response) => {
    const user = request.user;
    const blog = await Blog.findById(request.params.id);

    if (blog.user.toString() === user._id.toString()) {
      await Blog.findOneAndRemove(blog);
      return response.status(204).end();
    }

    response.status(401).json({ error: 'unauthorized user' });
  },
);
```

## NOTES ON MONGOOSE CONNECT FUNCTION

- dont use top-level await, as I'm using NodeNext it converts the outputted js to CommonJS which doesn't support it
- either use the await function and put void connectDB()
- or put call it in another async function (as in the app.listen() function in TomDoesTech example)
- or a mongoose.connect() and then mongoose.connection.on('error', (err) => ...)
- or use a normal promise.then().catch()
- note that all of these methods effectively don't wait for mongoose before app.listen, only the await inside app.listen will await the connection before logging server ready
- to put connectDB inside of app.listen - need to check if this is ok for supertest as the whole server will have to start rather than passing app to supertest

