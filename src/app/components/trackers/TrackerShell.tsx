import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { formatCo2e } from "../../../utils/emissionsMath";

interface TrackerShellProps {
  icon: ReactNode;
  title: string;
  monthlyKg: number;
  children: ReactNode;
}

export function TrackerShell({
  icon,
  title,
  monthlyKg,
  children,
}: TrackerShellProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
            {icon}
          </span>
          {title}
        </CardTitle>
        <Badge variant="secondary" className="tabular-nums">
          {formatCo2e(monthlyKg)}/mo
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}
