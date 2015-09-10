import express from 'express'
import request from 'superagent'
import swig from 'swig'
import moment from 'moment'
import _ from 'lodash'
let app = express()

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/../views');
app.set('view cache', false);
swig.setDefaults({
  cache: false
});
app.use(express.static('src/public'));

app.get('/api/:keyword', function(req, res) {
  request
    .get('http://haku.yle.fi/api/search')
    .query({
      q: req.params.keyword,
      keyword: req.params.keyword
    })
    .set('Accept', 'application/json')
    .end(function(err, response) {
      let results = _.map(response.body.results, (result) => {
        result.date = moment(result.date).format('D.M.YYYY')
        return result
      })
      res.render('index', {
        keyword: req.params.keyword,
        results: results
      })
    })
})

let server = app.listen(process.env.PORT || 3000, () => {
  let host = server.address().address
  let port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
});
