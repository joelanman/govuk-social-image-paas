const child = require('child_process')
const fs = require('fs')
const http = require('http')
const request = require('request')
const url = require('url')

const port = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  const queryData = url.parse(req.url, true).query

  const basepath = queryData.path

  const apiURL = 'https://www.gov.uk/api/content/' + basepath
  console.log(apiURL)

  request(apiURL, function (error, apiResponse, apiBody) {
    if (error) {
      console.error(error)
      renderGeneric(res)
      return
    }

    // console.log(`STATUS: ${apiResponse.statusCode}`)
    // console.log(`HEADERS: ${JSON.stringify(apiResponse.headers, null, '  ')}`)

    var title = 'GOV.UK'
    try {
      const contentItem = JSON.parse(apiBody)
      // console.log(`contentItem: ${JSON.stringify(contentItem, null, '  ')}`)
      title = contentItem.title
    } catch (e) {
      console.log('Error parsing JSON')
      renderGeneric(res)
      return
    }

    render(title, res)
  })
})

server.listen(port, () => {
  console.log(`Server running on ${port}`)
})

function render (title, res) {
  if (typeof title !== 'string') {
    console.log('title is not a string')
    renderGeneric(res)
    return
  }
  var length = title.length
  var pointsize = 88

  if (length > 42 && length <= 76) {
    pointsize = 65
  } else if (length > 76 && length <= 130) {
    pointsize = 46
  } else if (length > 130) {
    console.log('title is longer than 130 characters')
    renderGeneric(res)
    return
  }

  var convertChild = child.spawn('convert', ['-fill', 'white',
    '-background', 'transparent',
    '-font', 'GDSTransportBold.ttf',
    '-pointsize', pointsize,
    '-size', '1040x310',
    '-interline-spacing', '-10',
    'caption:' + title,
    '-gravity', 'North',
    'base.png',
    '+swap',
    '-geometry', '+0+80',
    '-composite',
    '/tmp/output.png'])

  convertChild.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString())
  })

  convertChild.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString())
  })

  convertChild.on('exit', function (code) {
    var error = (code !== 0)
    if (error) {
      console.error('child process exited with code ' + code.toString())
    } else {
      var filepath = '/tmp/output.png'
      fs.readFile(filepath, function (err, data) {
        if (err) {
          console.error('error reading tmp file')
          return
        }
        console.log('done')

        res.statusCode = 200
        res.setHeader('Content-Type', 'image/png')
        res.end(data, 'binary')
      })
    }
  })
}

function renderGeneric (res) {
  console.log('rendering generic image')
  const filepath = './generic.png'
  fs.readFile(filepath, function (err, data) {
    if (err) {
      console.error('error reading generic file')
      return
    }
    console.log('done')

    res.statusCode = 200
    res.setHeader('Content-Type', 'image/png')
    res.end(data, 'binary')
  })
}
