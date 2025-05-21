interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function Card({ children, title, subtitle, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 w-full ${className}`}>
      {(title || subtitle) && (
        <div className="text-center mb-6">
          {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>}
          {subtitle && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}