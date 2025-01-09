import Category from "../models/categoryModel.js";

const getCategories = async (req, res, next) => {
  try {
    console.log("request came");
    const categories = await Category.find();
    console.log(categories);
    res.status(200).send(categories);

  } catch (error) {
    return next(error);
  }
};

export { getCategories };