export interface LoggerService {
  info(message: string, _meta?: any): void;
  warn(message: string, _meta?: any): void;
  error(message: string, _meta?: any): void;
  debug(message: string, _meta?: any): void;
  setModule(module: string): void;
}
