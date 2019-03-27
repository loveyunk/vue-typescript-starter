declare namespace webapi {
  export interface IMixResult {
    /**
     * 请求是否成功
     */
    success: boolean;
    /**
     * 信息
     */
    message: string;
    /**
     * 状态码
     */
    statusCode: number;
  }
  /**
   * 后端接口通用数据
   */
  export interface IResponse<T = any> extends IMixResult {
    status: {
      code: number;
      message: string;
      timestape: number;
    };
    data: T;
  }

  export interface IPageableRequest {
    /**
     * 每页多少条数据 不传默认为10
     */
    pageSize?: number;
    /**
     * 第多少页 第一页为1 不传默认为1
     */
    currentPage?: number;
  }

  export interface IPageableResult<T = any> {
    result: T;
    /**
     * 总条数
     */
    totalCount: number;
  }

  export interface IAny {
    [key: string]: any;
  }

  export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

  export type ExcludeExtends<T, U> = { [K in keyof Omit<T, keyof U>]: T[K] };
}
