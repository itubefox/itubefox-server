const sig = require('./sig');
const END_POINT = 'https://www.youtube.com';

function getContentUrl(response, callback) {

    let content = response.data.match(/ytplayer.config = (.*?);ytplayer.load = function\(\) {yt.player.Application.create\("player-api", ytplayer.config, ytplayer.web_player_context_config\);ytplayer.config.loaded = true;};\(function\(\) {if \(!!window.yt && yt.player && yt.player.Application\) {ytplayer.load\(\);}}\(\)\);<\/script>/g);

    content = content[0].replace(/ytplayer.config = (.*?);ytplayer.load = function\(\) {yt.player.Application.create\("player-api", ytplayer.config, ytplayer.web_player_context_config\);ytplayer.config.loaded = true;};\(function\(\) {if \(!!window.yt && yt.player && yt.player.Application\) {ytplayer.load\(\);}}\(\)\);<\/script>/g, '$1');

    let content_parse = JSON.parse(content);
    content_parse.args.player_response = JSON.parse(content_parse.args.player_response);

    if (useCipher(content_parse)) {

        let file_base = END_POINT + content_parse.assets.js;

        sig.getTokens(file_base, function (tokens) {
            normalizeUrlStream(content_parse, tokens, function (content_parse_deciphered) {

                callback(content_parse_deciphered);
            });
        });
    } else {

        callback(content_parse);
    }
}

// Verifica se o streaming é criptografado
function useCipher(content_parse) {
    if (content_parse.args.player_response.streamingData.formats[0].url) {
        return false;
    } else {
        return true;
    }
}

// Normaliza a URL do streaming
function normalizeUrlStream(content_parse, tokens, callback) {

    // Ajusta parametros de formatos de stream
    for (let index = 0; index < content_parse.args.player_response.streamingData.formats.length; index++) {

        let params = content_parse.args.player_response.streamingData.formats[index].cipher.split(/&|\?/g);
        let data = {};

        params.forEach(function (param) {

            let value = param.split('=');
            let key = value[0];
            let final_value = decodeURIComponent(value[1]);
            data[key] = final_value;
        });

        content_parse.args.player_response.streamingData.formats[index].cipher = data;

        let signature = content_parse.args.player_response.streamingData.formats[index].cipher.s;

        content_parse.args.player_response.streamingData.formats[index].cipher.url = content_parse.args.player_response.streamingData.formats[index].cipher.url + '&sig=' + sig.decipher(tokens, signature);
        content_parse.args.player_response.streamingData.formats[index].cipher.s = sig.decipher(tokens, signature);
    }

    // Ajusta os parametros de formatos adaptativos de stream
    for (let index = 0; index < content_parse.args.player_response.streamingData.adaptiveFormats.length; index++) {

        let params = content_parse.args.player_response.streamingData.adaptiveFormats[index].cipher.split(/&|\?/g);
        let data = {};

        params.forEach(function (param) {

            let value = param.split('=');
            let key = value[0];
            let final_value = decodeURIComponent(value[1]);
            data[key] = final_value;
        });

        content_parse.args.player_response.streamingData.adaptiveFormats[index].cipher = data;

        let signature = content_parse.args.player_response.streamingData.adaptiveFormats[index].cipher.s;

        content_parse.args.player_response.streamingData.adaptiveFormats[index].cipher.url = content_parse.args.player_response.streamingData.adaptiveFormats[index].cipher.url + '&sig=' + sig.decipher(tokens, signature);
        content_parse.args.player_response.streamingData.adaptiveFormats[index].cipher.s = sig.decipher(tokens, signature);
    }

    callback(content_parse);
}

module.exports = getContentUrl;