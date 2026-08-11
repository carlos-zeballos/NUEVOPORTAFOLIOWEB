import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:brightness-110",
        navCta: "bg-nav-button text-foreground hover:bg-nav-button/80",
        hero: "bg-primary text-primary-foreground hover:brightness-110",
        heroOutline: "border border-foreground/20 bg-transparent text-foreground hover:bg-foreground/10",
      },
      size: { default: "h-10 px-4 py-2", lg: "h-11 px-8", sm: "h-9 px-3" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
));
Button.displayName = "Button";
