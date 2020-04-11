const axios = require('axios').default;
const request = require('request');
const itubefox = require('./itubefox');

function routes(host) {

    host.get('/', function (req, res) {
        res.json({status: 200, message: 'Servidor iTubefox.', repo: 'https://github.com/itubefox/itubefox-server', license: 'https://github.com/itubefox/itubefox-server/blob/master/LICENSE'});
    });

    host.get('/download', function (req, res) {
        res.set("Content-Type", "application/octet-stream");
        res.set("Content-disposition", "attachment; filename=\""+decodeURIComponent(req.query.filename)+"\"");
        request(req.query.url).pipe(res);
    });

    host.get('*', function (req, res) {
        res.status('404');
        res.json({status: 404, message: 'Not found'});
    });

    host.post('/download/audio', function (req, res) {
        axios.get(req.body.url).then(function (response) {
            itubefox(response, function (data) {

                let obj_final = {
                    url: '',
                    details: {},
                    thumbnail: '',
                    filename: ''
                };

                if (is_cipher(data)) {

                    obj_final.url = data.args.player_response.streamingData.adaptiveFormats[(data.args.player_response.streamingData.adaptiveFormats.length - 1)].cipher.url;
                } else {

                    obj_final.url = data.args.player_response.streamingData.adaptiveFormats[(data.args.player_response.streamingData.adaptiveFormats.length - 1)].url;
                }

                obj_final.details = data.args.player_response.videoDetails;
                obj_final.thumbnail = data.args.player_response.videoDetails.thumbnail.thumbnails[(data.args.player_response.videoDetails.thumbnail.thumbnails.length - 1)].url;
                obj_final.filename = data.args.player_response.videoDetails.title + '.mp3';

                res.json(obj_final);
            });
        }).catch(function () {
            res.json({});
        });
    });

    host.post('/download/video', function (req, res) {
        axios.get(req.body.url).then(function (response) {
            itubefox(response, function (data) {

                let obj_final = {
                    url: '',
                    details: {},
                    thumbnail: '',
                    filename: ''
                };

                if (is_cipher(data)) {

                    obj_final.url = data.args.player_response.streamingData.formats[(data.args.player_response.streamingData.formats.length - 1)].cipher.url;
                } else {

                    obj_final.url = data.args.player_response.streamingData.formats[(data.args.player_response.streamingData.formats.length - 1)].url;
                }

                obj_final.details = data.args.player_response.videoDetails;
                obj_final.thumbnail = data.args.player_response.videoDetails.thumbnail.thumbnails[(data.args.player_response.videoDetails.thumbnail.thumbnails.length - 1)].url;
                obj_final.filename = data.args.player_response.videoDetails.title + '.mp4';

                res.json(obj_final);
            });
        }).catch(function () {
            res.json({});
        });
    });
}

function is_cipher(data) {
    if (data.args.player_response.streamingData.formats[0].url) {
        return false;
    } else {
        return true;
    }
}

module.exports = routes;