import axios, {AxiosInstance} from 'axios';

const buildApiClient = (): AxiosInstance => {
  return axios.create({
    baseURL: window.appGlobal.baseUrl,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
};

export const apiClient = buildApiClient();

export const apiGet = async <T = unknown>(
  path: string,
  params?: Record<string, unknown>,
): Promise<T> => {
  const response = await apiClient.get(path, {params});
  return response.data as T;
};

export const apiPost = async <T = unknown>(
  path: string,
  data?: Record<string, unknown>,
): Promise<T> => {
  const response = await apiClient.post(path, data ?? {});
  return response.data as T;
};

export const apiPut = async <T = unknown>(
  path: string,
  data?: Record<string, unknown>,
): Promise<T> => {
  const response = await apiClient.put(path, data ?? {});
  return response.data as T;
};
