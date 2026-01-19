export type Response<T = {}, F = {}> =
  | ({ valid: true } & T)
  | ({ valid: false; reason: string } & F);

export type PromiseResponse<T = {}, F = {}> = Promise<Response<T, F>>;
