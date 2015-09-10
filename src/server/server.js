import express from 'express'
import request from 'superagent'
import swig from 'swig'
import moment from 'moment'
import _ from 'lodash'
import async from 'async'

let app = express()

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/../views');
app.set('view cache', false);
swig.setDefaults({
  cache: false
});
app.use(express.static('src/public'));

app.get('/:keyword', (req, res) => {
  async.parallel({
    header: getHeader,
    footer: getFooter,
    results: (callback) => {
      getResults(req.params.keyword, callback)
    }
  }, (err, data) => {
    res.render('index', {
      header: data.header.text,
      footer: data.footer.text,
      keyword: req.params.keyword,
      results: data.results
    })
  });
})

let server = app.listen(process.env.PORT || 3000, () => {
  let host = server.address().address
  let port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
});

let getHeader = (callback) => {
  request
    .get('http://yle.fi/global/api/load.php?version=5&modules=html/header')
    .end(callback)
}

let getFooter = (callback) => {
  request
    .get('http://yle.fi/global/api/load.php?version=5&modules=html/footer')
    .end(callback)
}

let getResults = (keyword, callback) => {
  request
    .get('http://haku.yle.fi/api/search')
    .query({
      q: keyword,
      keyword: keyword
    })
    .set('Accept', 'application/json')
    .end((err, response) => {
      let results = _.map(response.body.results, (result) => {
        result.date = moment(result.date).format('D.M.YYYY')
        return result
      })
      callback(err, results)
    })
}
