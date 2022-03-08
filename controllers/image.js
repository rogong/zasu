
const cloudinary = require('cloudinary');
const HttpStatus = require('http-status-codes');

const User = require('../models/userModels');

cloudinary.config({
    cloud_name: 'rogong',
    api_key: '622262996577752',
    api_secret: 'StmC7nLI03KTJt-L7LflweUq43U'
});

module.exports = {

    addImage(req, res) {
        cloudinary
            .uploader
            .upload(req.body.image, async (result) => {
                console.log(result);

                await User.update({
                    _id: req.user._id
                }, {
                        $push: {
                            images: {
                                imgId: result.public_id,
                                imgVersion: result.version
                            }
                        }
                    }).then(() => {
                        res
                            .status(HttpStatus.OK)
                            .json({ message: 'Image upload successfully' });
                    })
                    .catch(err => {
                        res
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .json({ message: 'Error uploading image' });

                    })
            });
    },

    async setDefaultImage(req, res) {
        const { imgId, imgVersion } = req.params;

        await User.update({
            _id: req.user._id
        }, {
                picId: imgId,
                picVersion: imgVersion

            }).then(() => {
                res
                    .status(HttpStatus.OK)
                    .json({ message: 'Profile image set successfully' });
            })
            .catch(err => {
                res
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Error occurred' });

            });
    }
}
