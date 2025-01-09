import Language from '../models/languageModel.js';

const getLanguages = async (req, res, next) => {

    try {
const language = await Language.find()
res.status(200).send(language)
    } catch (error) {
        return next(err)
    }

}

export { getLanguages };