"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Toaster as Sonner, ToasterProps } from "sonner";

export function Toaster({
    position = "top-right",
    closeButton = true,
    ...props
}: ToasterProps) {
    const { theme = "system" } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            position={position}
            closeButton={closeButton}
            expand={false}
            duration={4000}
            className="toaster group"
            richColors
            toastOptions={{
                // When we pass React elements as icons, we want them to be properly centered and sized
                style: {
                    "--toast-icon-margin": "0",
                } as React.CSSProperties,
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-background group-[.toaster]:border-border group-[.toaster]:text-foreground group-[.toaster]:shadow-lg group-[.toaster]:rounded-md group-[.toaster]:p-4 group-[.toaster]:flex group-[.toaster]:gap-3",
                    title:
                        "group-[.toast]:text-foreground group-[.toast]:font-medium group-[.toast]:text-sm",
                    description:
                        "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
                    actionButton:
                        "group-[.toast]:bg-amber-700 group-[.toast]:text-white group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:text-xs group-[.toast]:h-8 group-[.toast]:font-medium group-[.toast]:shadow-sm hover:group-[.toast]:bg-amber-800",
                    cancelButton:
                        "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:text-xs group-[.toast]:h-8 group-[.toast]:font-medium hover:group-[.toast]:bg-gray-200 dark:group-[.toast]:bg-gray-700 dark:group-[.toast]:text-gray-300 dark:hover:group-[.toast]:bg-gray-600",
                    // Wood-themed toast variants
                    success:
                        "group-[.toast]:border-l-4 group-[.toast]:border-l-green-600 group-[.toast]:bg-[#f2f7f2] dark:group-[.toast]:bg-[#2a3b2a]",
                    error:
                        "group-[.toast]:border-l-4 group-[.toast]:border-l-red-600 group-[.toast]:bg-[#fff2f2] dark:group-[.toast]:bg-[#3b2a2a]",
                    warning:
                        "group-[.toast]:border-l-4 group-[.toast]:border-l-amber-700 group-[.toast]:bg-[#fff8f0] dark:group-[.toast]:bg-[#3b352a]",
                    info:
                        "group-[.toast]:border-l-4 group-[.toast]:border-l-amber-700 group-[.toast]:bg-[#f8f3e9] dark:group-[.toast]:bg-[#2c241f]",
                    // Default matches our wood theme
                    default:
                        "group-[.toast]:border-l-4 group-[.toast]:border-l-amber-700 group-[.toast]:bg-[#f8f3e9] dark:group-[.toast]:bg-[#2c241f]",
                    // Add a class to style icons
                    icon: "group-[.toast]:flex group-[.toast]:items-center group-[.toast]:justify-center",
                },
            }}
            {...props}
        />
    );
}