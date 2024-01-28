import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: Date) {
  const options = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  const date = new Date(input);

  // @ts-expect-error Type not available
  const formattedDate = date.toLocaleString("en-US", options);

  const parts = formattedDate.split(", ");

  const datePart = parts[0]?.split("/");

  return `${parts[1]}, ${datePart?.[1]}/${datePart?.[0]}/${datePart?.[2]}`;
}

export const getPayload = (file: File, fields: { [key: string]: string }) => {
  const payload = new FormData();

  Object.entries(fields).forEach(([key, val]) => {
    payload.append(key, val);
  });

  payload.append("file", file);
  payload.append("Content-Type", "application-octet-stream");

  return payload;
};

export const getBucketUrl = (bucket: string) => {
  return `https://${bucket}.s3.ap-south-1.amazonaws.com`;
};

export const ITEMS_PER_PAGE = 10;