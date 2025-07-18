// hooks/useProducts.js
import useSWR from 'swr';
import { fetchProducts } from '../services/apiService';

const fetcher = async () => {
  const response = await fetchProducts();
  return response.data;
};

const useProducts = () => {
  const { data: products = [], error, mutate } = useSWR('products', fetcher);
  return {
    products,
    error,
    mutate,
  };
};

export default useProducts;
