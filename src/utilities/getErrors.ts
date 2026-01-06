import type { AxiosError } from "axios";

interface ResponseError {
  errors: {
    [key: string]: string[];
  };
}

export function getErrors(obj: AxiosError): string[] {
  const finalErrors: string[] = [];
  const data = obj.response?.data as ResponseError;
  const rawErrors = data?.errors;
  if (!rawErrors) {
    return [];
  }
  for (const key in rawErrors) {
    const messages = rawErrors[key].map((msg) => `${key}: ${msg}`);
    finalErrors.push(...messages);
  }

  return finalErrors;
}