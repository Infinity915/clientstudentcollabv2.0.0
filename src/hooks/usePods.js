import { useState, useEffect } from 'react';
import axios from 'axios';

const usePods = () => {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPods = async () => {
      try {
        const response = await axios.get('/api/pods');
        setPods(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPods();
  }, []);

  return { pods, loading, error };
};

export default usePods;
