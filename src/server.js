require('../config.js');
const express = require('express');

const userRouter = require('./routers/users.js');
const requestLogger = require('./middleware/request-logger.js');
const errorHandler = require('./middleware/error-handler.js');

const app = express();

app.use(requestLogger); // debug only
app.use(express.static('dist', {
    setHeaders: (res, path, stat) => {
        res.set('Cache-Control', 'public, s-maxage=86400');
    }
}));
app.use('/api', express.urlencoded(), userRouter);
app.get('/*', (req, res) => res.redirect('/'));
app.use(errorHandler);

const port = 80;
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}...`);
});
