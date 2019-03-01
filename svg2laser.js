

const fs = require('fs');
const sax = require('sax/lib/sax');

var parser = sax.parser(true);

const WIDTH = 4094;
const HEIGHT = 3072;

var totalVertices = 0;
var paths = [];
var translate = {
    'x': 0,
    'y': 0
};


parser.onerror = function (e) {
    // an error happened.
};


parser.ontext = function (t) {
    // got some text.  t is the string of text.
};


parser.onopentag = function (node) {
    // opened a tag.  node has "name" and "attributes"
    if(node.name === 'g') {
        if(node.attributes.hasOwnProperty('transform')) {
            var transform = node.attributes['transform'];

            if (transform.search(/translate/g) !== -1) {
                transform = transform.replace(/translate\(/, '');
                transform = transform.replace(/\)/, '');
                var trans = transform.split(',');
                translate.x += Number(trans[0]);
                translate.y += Number(trans[1]);
                // console.log(translate);
            }
        }
    }

    if(node.name === 'path') {
        var path = {
            'id': node.attributes['id'],
            'vertices': []
        };

        if(node.attributes.hasOwnProperty('d')) {
            var commands = node.attributes['d'].split(/\s/g);
            var draw = true;
            var curr = {
                'x': translate.x,
                'y': translate.y
            };

            var save = {
                'x': translate.x,
                'y': translate.y
            };

            for(let cntr = 0; cntr < commands.length; cntr++) {
                let command = commands[cntr];

                if(command === 'm') {
                    draw = false;
                }
                else {
                    if(command === 'z') {
                        curr.x = save.x;
                        curr.y = save.y;
                    }
                    else {
                        let comps = command.split(',');

                        curr.x = Math.round(Number(comps[0]) + curr.x);
                        curr.y = Math.round(Number(comps[1]) + curr.y);

                        if(!draw) {
                            save.x = curr.x;
                            save.y = curr.y;
                        }
                    }

                    path.vertices.push({
                        'x': curr.x - WIDTH / 2,
                        'y': -1 * (curr.y - (HEIGHT / 2)),
                        'c': draw
                    });

                    totalVertices++;

                    draw = true;
                }
            }
        }

        paths.push(path);
        // console.log(path);
    }
};


parser.onattribute = function (attr) {
    // an attribute.  attr has "name" and "value"
};


parser.onend = function () {
    // parser stream is done, and ready to have more stuff written to it.
};


fileData = fs.readFileSync('GiantPong.svg');
// fileData = fs.readFileSync('square.svg');
parser.write(fileData);

console.log('Shape svg2Laser(' + totalVertices + ');');
console.log('');
console.log('svg2Laser <<');

paths.forEach(function(path) {

    for(let cntr = 0; cntr < path.vertices.length; cntr++) {
        let lastChar = ',';

        console.log('   ' + path.vertices[cntr].x + ', ' +
                    path.vertices[cntr].y + ', 0, ' +
                    (path.vertices[cntr].c ? '1' : '0') + lastChar);
    }
});
