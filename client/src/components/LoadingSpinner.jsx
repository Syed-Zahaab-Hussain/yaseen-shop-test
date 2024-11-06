// import { cn } from "@/lib/utils";

// export const LoadingSpinner = ({ size = 24, className, ...props }) => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width={size}
//       height={size}
//       {...props}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className={("animate-spin", className)}
//     >
//       <path d="M21 12a9 9 0 1 1-6.219-8.56" />
//     </svg>
//   );
// };

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);
