const multer = require('multer');

const storage = multer.diskStorage({
    destination: (require, file, callback) => {
        callback(null, './public/images')
    },
    filename: (require, file, callback) => {
        callback(null, `${Date.now().toString()}-${file.originalname}`)
    }
});

const fileFilter = (require, file, callback) => {
    const isAccepted = ['image/png', 'image/jpg', 'image/jpeg']
        .find(isAcceptedFormat => isAcceptedFormat == file.mimetype)

        if(isAccepted) {
            return callback(null, true);
        };

        return callback(null, false);
};

module.exports = multer({
    storage,
    fileFilter
});