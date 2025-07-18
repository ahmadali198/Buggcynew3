import axios from "axios";

const BASE_URL = "https://fakestoreapi.com/products";

// Fetch all products
export const fetchProducts = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

// Fetch product by ID
export const fetchProductById = async (id) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};

// Fetch product categories
export const fetchCategories = async () => {
  const res = await axios.get(`${BASE_URL}/categories`);
  return res.data;
};

// Fetch products by category
export const fetchProductsByCategory = async (category) => {
  const res = await axios.get(`${BASE_URL}/category/${category}`);
  return res.data;
};
