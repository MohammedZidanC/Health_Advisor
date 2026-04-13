const sharp = require('sharp');

Promise.all([
    sharp('logo.svg').png().toFile('logo.png'),
    sharp('logo-full.svg').png().toFile('logo-full.png')
]).then(() => {
    console.log("PNGs successfully generated!");
}).catch(err => {
    console.error("Error generating PNGs:", err);
});
