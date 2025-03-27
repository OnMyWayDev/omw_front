import axios, {AxiosError} from 'axios';
import {BASE_URL} from '../config/consts/api';
import {Alert} from 'react-native';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('BASE_URL', BASE_URL);
axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  async (error: AxiosError) => {
    //FIXME: uncomment if needed
    // Alert.alert(
    //   '오류',
    //   '서버와의 통신에 문제가 발생했습니다. 다시 시도해주세요.',
    // );
    onError(error, error?.config?.url);
    return Promise.reject(error);
  },
);

const randomUserAgent = () => {
  const userAgentList = [
    'Mozilla/5.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    'Mozilla/5.0 (Linux; Android 11; Pixel 5)',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
  ];
  return userAgentList[Math.floor(Math.random() * userAgentList.length)];
};

export const kakaoInstance = axios.create({
  baseURL: 'https://place-api.map.kakao.com/places/panel3/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Referer: 'https://place.map.kakao.com/',
    Origin: 'https://place.map.kakao.com',
    Pf: 'web',
    'Accept-language': 'ko',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'User-Agent': 'Mozilla/5.0',
  },
});

kakaoInstance.interceptors.request.use(config => {
  config.headers['User-Agent'] = randomUserAgent();
  return config;
});

kakaoInstance.interceptors.response.use(
  response => {
    return response;
  },
  async (error: AxiosError) => {
    onError(error, error?.config?.url);
    return Promise.reject(error);
  },
);

const onError = (err: AxiosError, apiUrl: string | undefined) => {
  console.log('Response error', err.message);
  if (err.response) {
    console.log(
      apiUrl,
      ': ',
      '요청이 이루어 졌으나 서버가 2xx의 범위를 벗어나는 상태 코드로 응답했습니다.',
      err.response,
    );
  } else if (err.request) {
    console.log(
      apiUrl,
      ': ',
      '요청이 이루어 졌으나 응답을 받지 못했습니다.',
      err.request._response,
    );
  } else {
    console.log(
      apiUrl,
      ': ',
      '오류를 발생시킨 요청을 설정하는 중에 문제가 발생했습니다.',
      err.message,
    );
  }
};
