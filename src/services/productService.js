import {
  addProductToDB,
  getAllProductsFromDB,
  deleteProductFromDB,
  updateProductInDB,
} from "../utils/db";

export const createProduct = async (product) => {
  await addProductToDB(product);
};

export const getAllProducts = async () => {
  return await getAllProductsFromDB();
};

export const deleteProduct = async (id) => {
  await deleteProductFromDB(id);
};

export const updateProduct = async (product) => {
  await updateProductInDB(product);
};
