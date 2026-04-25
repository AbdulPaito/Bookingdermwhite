import { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export const AdminLayout = ({ title, description, action, children }: Props) => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/30 lg:flex-row">
      <Sidebar />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
              {description && <p className="mt-1 text-muted-foreground">{description}</p>}
            </div>
            {action}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};