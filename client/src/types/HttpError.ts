export interface HttpError extends Error {
  response?: {
    status: number;
  };
}
