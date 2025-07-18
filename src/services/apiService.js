// services/apiService.js
import axios from 'axios';

const BASE_URL = 'https://fakestoreapi.com';

export const fetchProducts = () => axios.get(`${BASE_URL}/products`);
export const fetchProductById = (id) => axios.get(`${BASE_URL}/products/${id}`);
