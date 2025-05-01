import { cva } from 'class-variance-authority';

export const authContainerVariants = cva(
  // Base styles
  "relative flex flex-col items-center justify-center w-full max-w-md mx-auto rounded-xl shadow-lg transition-all duration-300",
  {
    variants: {
      type: {
        login: [
          "bg-gradient-to-br from-blue-50 to-white",
          "border border-blue-100",
          "shadow-blue-100/50",
        ],
        register: [
          "bg-gradient-to-br from-emerald-50 to-white",
          "border border-emerald-100",
          "shadow-emerald-100/50",
        ],
      },
      userType: {
        student: [
          "hover:shadow-lg",
          "hover:scale-[1.01]",
        ],
        parent: [
          "hover:shadow-lg",
          "hover:scale-[1.01]",
        ],
      },
    },
    defaultVariants: {
      type: "login",
      userType: "student",
    },
  }
);

export const authHeaderVariants = cva(
  // Base styles
  "text-center mb-6",
  {
    variants: {
      type: {
        login: [
          "text-blue-900",
        ],
        register: [
          "text-emerald-900",
        ],
      },
      userType: {
        student: [
          "font-medium",
        ],
        parent: [
          "font-medium",
        ],
      },
    },
    defaultVariants: {
      type: "login",
      userType: "student",
    },
  }
);

export const authButtonVariants = cva(
  // Base styles
  "w-full py-2 px-4 rounded-lg font-medium transition-all duration-300",
  {
    variants: {
      type: {
        login: [
          "bg-blue-600 hover:bg-blue-700 text-white",
          "active:scale-[0.98]",
        ],
        register: [
          "bg-emerald-600 hover:bg-emerald-700 text-white",
          "active:scale-[0.98]",
        ],
      },
      userType: {
        student: [
          "text-sm md:text-base",
        ],
        parent: [
          "text-sm md:text-base",
        ],
      },
    },
    defaultVariants: {
      type: "login",
      userType: "student",
    },
  }
); 