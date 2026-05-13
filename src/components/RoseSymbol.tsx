type RoseSymbolProps = {
  className?: string;
};

export default function RoseSymbol({ className = "h-4 w-4" }: RoseSymbolProps) {
  return (
    <svg
      viewBox="0 0 32 48"
      className={className}
      aria-label="Rose"
      role="img"
    >
      <path
        d="M14 18c-6.8-2-9.2-6.4-7.8-10.1 1.2-3.2 5.3-3.8 8.2-1.4 1.5-3.1 6.5-4.8 9.6-1.6 3.2 3.2 1.8 8.6-3.5 12.1 3.9.2 6.2 2.2 6 5-.3 3.7-4.5 6.1-10 6.1-6.6 0-11.4-2.9-11.4-7 0-3.3 3.3-5.1 8.9-3.1Z"
        fill="#ef233c"
      />
      <path
        d="M11.2 9.8c3.7 1.4 6.8 3.7 9.3 6.8m-9 1.6c2.6-2 5.6-3.2 9-3.5m-3.1-8.2c1.6 2.2 2.1 4.4 1.5 6.8"
        fill="none"
        stroke="#fff7f0"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M16.7 27.3c.2 6.4-.5 12.4-2.2 18"
        fill="none"
        stroke="#111"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
      <path
        d="M15.3 34.9c-3.8-2.3-6.9-2.2-9.3.4 2.9 2.5 5.9 2.7 9.3-.4Zm1.1 3.4c4.2-2.9 7.8-3.1 10.7-.5-3 3.3-6.6 3.5-10.7.5Z"
        fill="#050505"
      />
    </svg>
  );
}
