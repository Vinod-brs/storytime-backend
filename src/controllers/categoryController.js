import Category from "../models/categoryModel.js";

const getCategories = async (req, res, next) => {
  try {
    // console.log("request came");
    const categories = await Category.find();
    // console.log(categories);
    res.status(200).json(categories);

  } catch (error) {
    return next(error);
  }
};


//------------------------ ADMIN CONTROLS ------------------------

const addCategories = async (req, res, next) => {
        
  let {category, keywords} = req.body
  
  try {
      if(!req.user.isAdmin){
          const err = new Error("Unauthorized");
          err.statusCode = 401;
          return next(err);
      }

      if(!category || !keywords){
          const err = new Error ("category, keywords is required");
          err.statusCode = 404;
          return next(err)
      }

      category = category.trim()
      keywords = keywords.trim()
      


      // check Language exist or not
      const categoryExists = await Category.findOne({category})
      if(categoryExists){
          res.status(400)
          const err = new Error(category + " category already exists. Please add different language!")
          return next(err)
      }

  
      // save user to DB
      const categorydb = await Category.create({
        category,
        keywords,
      });
  
      

      return res.status(201).json({
          message:
          "New Category added successfully.",
      });
      
  } catch (error) {
      // console.log(error)
      res.status(400)
          const err = new Error("unable to add category")
          return next(err)
  }   
};

const updateCategories = async (req, res, next) => {
  const { id, category, keywords} = req.body;
  try{
      if(!req.user.isAdmin){
          const err = new Error("Unauthorized");
          err.statusCode = 401;
          return next(err);
      }

      if(!id || !category || !keywords){
          const err = new Error("category, keywords required");
          err.statusCode = 404;
          return next(err)
      }

      const categorydb = await Category.findById(id)
      if(!categorydb){
      const err = new Error("Category not found");
      err.statusCode = 404;
      return next(err);
      }

      categorydb.category = category.trim() || categorydb.category
      categorydb.keywords = keywords.trim() || categorydb.keywords
                 
      await categorydb.save()
      return res.status(200).json({ message: "Category updated successfully"})
  }catch(er){
      return next(er)
  }
  
}

const deleteCategories = async (req, res, next) => {
  
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
      const response = await Category.deleteOne({ _id: id });

      if (response.deletedCount === 1) {
         return res.status(200).send({ message: 'Category deleted successfully'});
      } else {
          return res.status(404).send({ message: 'Category not found'});
      }
  
      
  } catch (error) {
      // console.log(error)
      res.status(400)
          const err = new Error("unable to Delete Category")
          return next(err)
  }   
};

export { getCategories, addCategories, updateCategories, deleteCategories };