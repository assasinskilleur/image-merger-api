const express = require('express')
const bodyParser = require('body-parser')
const mergeImg = require('merge-img');
const Jimp = require('jimp');
const fs = require('fs');
const cors = require('cors')

const app = express()
const port = process.env.PORT || 8080

app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

list_images = [];

function getAllImages() {
    const folder = './assets/images/merging/';
    fs.readdirSync(folder).forEach(file => {
        list_images.push(folder + file);
    })
}

getAllImages();

const versus = new Jimp('assets/images/versus.png', function (err, img) {
    err ? console.log('logo err' + err) : console.log('logo created and ready for use');
    return img.opacity(1).scale(0.5);
});

app.get('/api/image/merge', (req, res) => {
    const image1 = list_images[0];
    const image2 = list_images[1];
    mergeImg([image1, image2], { align: 'center' }).then((img) => {
        // img.composite(versus, img.bitmap.width / 2, img.bitmap.height / 2);
        img.getBuffer(Jimp.MIME_PNG, (error, data) => {
            Jimp.read(data).then((jimpImage) => {
                jimpImage.composite(versus, (jimpImage.bitmap.width / 2) - (versus.bitmap.width / 2), (jimpImage.bitmap.height / 2) - (versus.bitmap.height / 2));
                jimpImage.getBuffer(Jimp.MIME_PNG, (error, dataD) => {
                    const i = Buffer.from(dataD, 'base64');
                    res.writeHead(200, {
                        'Content-Type': 'image/png',
                        'Access-Control-Allow-Origin': "*",
                        'Content-Length': i.length
                    });
                    res.end(i);
                });
            })
        })
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
