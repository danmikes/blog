const express = require('express')
const app = express()
const { MongoClient } = require('mongodb')

app.use(express.json())

const withDB = async (operations, res) => {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    const db = client.db('blog')
    await operations(db)
    client.close()
  } catch(error) {
    res.status(500).json({message: 'error connecting to db', error})
  }
}

app.get('/api/articles/:name', async (req, res) => {
  const articleName = req.params.name
  withDB(async (db) => {
    const articleInfo = await db.collection('articles').findOne({ name: articleName })
    res.status(200).json(articleInfo)
  }, res)
})

app.get('/hello', (req, res) => res.send('hello'))

app.get('/hello/:name', (req, res) => res.send(`hello ${req.params.name}`))

app.post('/hello', (req, res) => res.send(`hello ${req.body.name}`))

app.post('/api/articles/:name/add-comment', (req, res) => {
  const { username, text } = req.body
  const articleName = req.params.name

  withDB(async (db) => {
    const articleInfo = await db.collection('articles').findOne({ name: articleName })
    await db.collection('articles').updateOne(
      { name: articleName },
      { $set: {
        comments: articleInfo.comments.concat({username, text})
        }
      }
    )
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName })
    res.status(200).json(updatedArticleInfo)
  }, res)
})

app.listen(8000, () => console.log('listening on port 8000'))