import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, AxiosInstance } from 'axios';
import { TIME_OUT, CANCEL_REQUEST_MESSAGE } from './config';
import { getCurrentEnv } from './index';
import qs from 'qs';
import { message } from 'antd';
import API from '../services/api';
import store from '../store';
import { setAuth } from '../store/actions';

const baseURL: string = getCurrentEnv();

const client: AxiosInstance = axios.create({
  baseURL,
  timeout: TIME_OUT,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

const request = (options: AxiosRequestConfig): Promise<webapi.IResponse> => {
  if (/post/i.test(options.method as string)) {
    options.data = options.params;
    delete options.params;
  }

  // 数据请求成功
  const onSuccess = (response: AxiosResponse<webapi.IResponse>): Promise<webapi.IResponse> => {
    const { statusText, status, data } = response;

    let result: any = {};
    if (typeof data === 'object') {
      result = data;
      if (Array.isArray(data)) {
        result.list = data;
      }
    } else {
      result.data = data;
    }

    return Promise.resolve({
      success: true,
      message: statusText,
      statusCode: status,
      ...result
    });
  };

  // 数据请求失败 网络错误
  const onError = (error: AxiosError) => {
    let msg;
    let statusCode;

    if (error.response) {
      message.error(`请求失败😭${error.message}`);
    } else if (error.code === 'ECONNABORTED') {
      message.error(`请求超时😭${error.message}`);
    } else {
      message.error(`未知错误😭${error.message}`);
    }

    if (String(error.message) === CANCEL_REQUEST_MESSAGE) {
      return Promise.reject({
        success: false
      });
    }

    if (error.response && error.response instanceof Object) {
      const { data, statusText } = error.response;
      statusCode = error.response.status;
      msg = data.message || statusText;
    } else {
      statusCode = 600;
      msg = error.message || 'Network Error';
    }

    // 目前ts不支持error类型
    return Promise.reject({
      statusCode,
      success: false,
      message: msg
    });
  };

  return client(options)
    .then(onSuccess)
    .catch(onError);
};

// 为每个请求添加token
client.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const method: string = config.method as string;
    const token = store.getState().auth && store.getState().auth!.token;
    if (/get/i.test(method)) {
      config.params.token = token;
    } else if (/post/i.test(method)) {
      config.data.token = token;
      // Using application/x-www-form-urlencoded format
      config.data = qs.stringify(config.data);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
client.interceptors.response.use(
  (response: AxiosResponse<webapi.IResponse>) => {
    if (response.data.status.code === API.ErrorCode.TOKEN_INVALID) {
      message.error('token 失效');
      store.dispatch(setAuth(null));
      localStorage.removeItem('token');
      // 路由得定向回登录页
      // ...
    }
    return response;
  },
  error => {
    // reject 错误信息 onError处理
    return Promise.reject(error);
  }
);

export default request;
