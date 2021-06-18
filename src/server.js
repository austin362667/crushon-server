require('../config.js');
const express = require('express');

const userRouter = require('./routers/users.js');
const requestLogger = require('./middleware/request-logger.js');
const errorHandler = require('./middleware/error-handler.js');

const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const userModel = require('./model/user.js');
const { uploadFile, getFileStream } = require('./s3')

const app = express();

app.use(requestLogger); // debug only
app.use(express.static('dist', {
    setHeaders: (res, path, stat) => {
        res.set('Cache-Control', 'public, s-maxage=86400');
    }
}));
app.use('/api', express.urlencoded(), userRouter);
// app.get('/*', (req, res) => res.redirect('/'));


app.get('/images/:key', (req, res) => {
    console.log(req.params)
    const key = req.params.key
    const readStream = getFileStream(key)
  
    readStream.pipe(res)
  })
  
  app.post('/images', upload.single('image'), async (req, res) => {
    const file = req.file
    console.log(file)
  
    // apply filter
    // resize 
  
    const result = await uploadFile(file)
    await unlinkFile(file.path)
    console.log(result)
    // const description = req.body.description
    userModel
    .update_photo(req.body.id, `/images/${result.Key}`)
      .then((user) => {
      });

    res.send({imagePath: `/images/${result.Key}`})
  })

  app.use(errorHandler);

  const port = 80;
  app.listen(port, () => {
      console.log(`Server is up and running on port ${port}...`);
  });