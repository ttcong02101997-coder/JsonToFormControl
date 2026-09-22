import React from "react";

export const IconLock = () => {
    return (
        <div style={{ marginTop: 2 }}>
            <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M5.5 6V4.5C5.5 3.11929 6.61929 2 8 2C9.38071 2 10.5 3.11929 10.5 4.5V6"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                />

                <rect
                    x="3"
                    y="5.5"
                    width="10"
                    height="8.5"
                    rx="1.25"
                    stroke="currentColor"
                    strokeWidth="1"
                />

                <circle
                    cx="8"
                    cy="8.5"
                    r="0.75"
                    fill="currentColor"
                />

                <path
                    d="M8 9.25V11"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}

export const SearchIcon = (
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle
            cx="9"
            cy="5"
            r="4.5"
            stroke="currentColor"
            strokeWidth="1"
        />
        <path
            d="M6.2 7.8L1.5 14.5"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
        />
    </svg>
);

export const NewIcon = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 16 16"
    >
        <path
            d="M8 3v10M3 8h10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);
