import React from "react";

export function CustomStarIcon({
  className = "w-4 h-4",
  fill = "#070707",
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={fill}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <title>star</title>
      <path
        fill={fill}
        d="m5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z"
      />
    </svg>
  );
}

export function CustomLightningBoltIcon({
  className = "w-4 h-4",
  fill = "#070707",
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="4 0 16 24"
      fill={fill}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <title>lightning-bolt</title>
      <path
        fill={fill}
        stroke={fill}
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        d="M11 15H6l7-14v8h5l-7 14z"
      />
    </svg>
  );
}

export function CustomPetIcon({
  className = "w-4 h-4",
  stroke = "#070707",
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <title>pet</title>
      <path
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M4.41 16.75C4.17 19.64 6.35 22 9.25 22h4.79c3.26 0 5.5-2.63 4.96-5.85c-.57-3.38-3.83-6.15-7.26-6.15c-3.72 0-7.02 3.04-7.33 6.75m6.06-9.25a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5m6.83 1.2a2 2 0 1 0 0-4a2 2 0 0 0 0 4m3.7 4a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m-17.03-2a2 2 0 1 0 0-4a2 2 0 0 0 0 4"
      />
    </svg>
  );
}
