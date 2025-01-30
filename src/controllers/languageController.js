import Language from '../models/languageModel.js';

    const getLanguages = async (req, res, next) => {

        try {
            const language = await Language.find()
            res.status(200).send(language)
        } catch (error) {
            return next(error)
        }

    }


    //------------------------ ADMIN CONTROLS ------------------------

    const addLanguages = async (req, res, next) => {
        
        let {name, code} = req.body
        
        try {
            if(!req.user.isAdmin){
                const err = new Error("Unauthorized");
                err.statusCode = 401;
                return next(err);
            }

            if(!name || !code){
                const err = new Error ("name, code is required");
                err.statusCode = 404;
                return next(err)
            }

            name = name.trim()
            code = code.trim()
            


            // check Language exist or not
            const LanguageExists = await Language.findOne({name})
            if(LanguageExists){
                res.status(400)
                const err = new Error(name + " Language already exists. Please add different language!")
                return next(err)
            }

        
            // save user to DB
            const languages = await Language.create({
                name,
                code,
            });
        
            

            return res.status(201).json({
                message:
                "New Language added successfully.",
            });
            
        } catch (error) {
            // console.log(error)
            res.status(400)
                const err = new Error("unable to add language")
                return next(err)
        }   
    };

    const updateLanguages = async (req, res, next) => {
        const { id, name, code} = req.body;

        try{
            if(!req.user.isAdmin){
                const err = new Error("Unauthorized");
                err.statusCode = 401;
                return next(err);
            }

            if(!id || !name || !code){
                const err = new Error("name, code required");
                err.statusCode = 404;
                return next(err)
            }

            const language = await Language.findById(id)
            if(!language){
            const err = new Error("Language not found");
            err.statusCode = 404;
            return next(err);
            }

            language.name = name.trim();
            language.code = code.trim();
                       
            await language.save()
            return res.status(200).json({ message: "Language updated successfully"})
        }catch(er){
            return next(er)
        }
        
    }

    const deleteLanguages = async (req, res, next) => {
        
        let {id} = req.body
        
        try {
            if(!req.user.isAdmin){
                const err = new Error("Unauthorized");
                err.statusCode = 401;
                return next(err);
            }

            if(!id){
                const err = new Error ("id is required");
                err.statusCode = 404;
                return next(err)
            }

            id = id.trim()

            // check Language exist or not
            const response = await Language.deleteOne({ _id: id });

            if (response.deletedCount === 1) {
               return res.status(200).send({ message: 'Language deleted successfully'});
            } else {
                return res.status(404).send({ message: 'Language not found'});
            }
        
            
        } catch (error) {
            // console.log(error)
            res.status(400)
                const err = new Error("unable to Delete language")
                return next(err)
        }   
    };

export { getLanguages, addLanguages, updateLanguages, deleteLanguages };