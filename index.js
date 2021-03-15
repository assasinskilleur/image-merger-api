const express = require('express')
const bodyParser = require('body-parser')
const mergeImg = require('merge-img');
const Jimp = require('jimp');
const fs = require('fs');
const cors = require('cors')
const path = require('path');
const uuid = require('uuid');

const app = express()
const port = process.env.PORT || 8080

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/hello.html'));
})

list_images = [];

const image_folder = './assets/images/merging/';

function getAllImages() {
    fs.readdirSync(image_folder).forEach(file => {
        list_images.push(image_folder + file);
    })
}

getAllImages();

const versus = new Jimp('assets/images/versus.png', (err, img) => {
    err ? console.log('versus err' + err) : console.log('versus image created and ready for use');
    return img.opacity(1).scale(0.5);
});

const user_image = new Jimp('assets/images/user_image.png', (err, img) => {
    err ? console.log('userImage err' + err) : console.log('user image created and ready for use')
    return img.opacity(1);
})

app.get('/api/image/merge', (req, res) => {
    const image1 = list_images[Math.floor(Math.random() * Math.floor(list_images.length))];
    const image2 = list_images[Math.floor(Math.random() * Math.floor(list_images.length))];
    mergeImg([image1, image2], {align: 'center'}).then((img) => {
        Jimp.read(image1).then((dt) => {
            img.getBuffer(Jimp.MIME_PNG, (error, data) => {
                Jimp.read(data).then((jimpImage) => {
                    jimpImage.composite(versus, dt.bitmap.width - (versus.bitmap.width / 2), (jimpImage.bitmap.height / 2) - (versus.bitmap.height / 2));
                    jimpImage.getBase64(Jimp.MIME_PNG, (error, dataD) => {
                        res.json(dataD);
                    });
                })
            })
        });
    });
});

app.get('/api/image/rank/:text', (req, res) => {
    const img = user_image.clone();
    const rank = req.params.text.toUpperCase();
    new Jimp(rank.length * 180, 256, (err, emptyimg) => {
        Jimp.loadFont('./assets/font/rank.fnt').then((font) => {
            emptyimg.print(font, 0, 0, rank);
            emptyimg.rotate(20);
            img.composite(emptyimg, (img.bitmap.width / 2) - (emptyimg.bitmap.width / 2.5), (img.bitmap.height / 2) - (emptyimg.bitmap.height / 3));
            img.getBase64(Jimp.MIME_PNG, (error, dataD) => {
                res.json(dataD);
            });
        });
    });
});

app.post('/api/image/save', (req, res) => {
    const image = req.body.image;
    Jimp.read(image).then(( image) => {
        image.resize(Jimp.AUTO, 512);
        const imageName = image_folder + uuid.v4() + "." + image.getExtension();
        image.write(imageName);
        list_images.push(imageName);
        res.json({ error: 0, message: "Image sauvegardé" });
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
