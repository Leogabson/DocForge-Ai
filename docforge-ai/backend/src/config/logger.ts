export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class StructuredLogger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, data: any) {
    const timestamp = this.getTimestamp();
    const payload = typeof data === 'string' ? { message: data } : data;

    const logEntry = {
      timestamp,
      level,
      ...payload,
    };

    const output = JSON.stringify(logEntry);

    if (level === LogLevel.ERROR) {
      console.error(output);
    } else if (level === LogLevel.WARN) {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  public debug(data: any) {
    if (process.env.NODE_ENV !== 'production') {
      this.log(LogLevel.DEBUG, data);
    }
  }

  public info(data: any) {
    this.log(LogLevel.INFO, data);
  }

  public warn(data: any) {
    this.log(LogLevel.WARN, data);
  }

  public error(data: any) {
    this.log(LogLevel.ERROR, data);
  }
}

export const logger = new StructuredLogger();
