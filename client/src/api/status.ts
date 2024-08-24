import axios from 'axios';

// NOT BEING USED
export async function getStatus() {
  const res = await axios.get<string>('/api/status', { withCredentials: true });
  return res;
}

