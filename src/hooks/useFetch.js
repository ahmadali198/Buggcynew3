import useSWR from "swr";
import axios from "axios";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const useFetch = (url) => {
  const { data, error, isLoading } = useSWR(url, fetcher);
  return {
    data,
    error,
    loading: isLoading,
  };
};

export default useFetch;
