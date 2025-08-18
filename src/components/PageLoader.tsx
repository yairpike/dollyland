import { LoadingAnimation } from "./LoadingAnimation";

interface PageLoaderProps {
  message?: string;
}

export const PageLoader = ({ message = "Loading..." }: PageLoaderProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <LoadingAnimation size="lg" />
        <div className="text-muted-foreground text-lg font-medium">
          {message}
        </div>
      </div>
    </div>
  );
};