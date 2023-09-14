import express from "express";

export type PaginationRequest<T = {}> = express.Request<
  {},
  {},
  {},
  { pageSize: string; page: string } & T
>;

export type CustomRequest<T> = express.Request<{}, {}, {}, T>;
