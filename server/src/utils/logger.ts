import dayjs from 'dayjs';
import { Request } from 'express';

const color = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  grey: `\x1b[1;39m`,
  reset: '\x1b[0m',
};

const methodColor: { [key: string]: string } = {
  GET: color.green,
  POST: color.blue,
  PUT: color.yellow,
  PATCH: color.yellow,
  DELETE: color.magenta,
};

const url = new RegExp(/http:[^\s]+[\w]/);

const highlightURL = (text: string) =>
  text.replace(url, `${color.cyan}${String(url.exec(text))}${color.reset}`);

const formatInfoMessage = (message: string) => {
  const timestamp = dayjs().format('HH:mm:ss');
  console.log(
    `${color.grey}${timestamp} ${color.cyan}INFO${color.reset}\t${highlightURL(
      message
    )}${color.reset}`
  );
};

const formatErrorMessage = (message: string) => {
  const timestamp = dayjs().format('HH:mm:ss');
  console.log(
    `${color.grey}${timestamp} ${color.red}ERROR\t${highlightURL(message)}${
      color.reset
    }`
  );
};

const formatRequestMessage = (req: Request) => {
  const timestamp = dayjs().format('HH:mm:ss');
  console.log(
    `${color.grey}${timestamp} ${methodColor[req.method]}${req.method}\t${
      req.path
    }${color.reset}\n${JSON.stringify(req.headers, null, 2)}`
  );
};

export default {
  info: formatInfoMessage,
  error: formatErrorMessage,
  request: formatRequestMessage,
};

