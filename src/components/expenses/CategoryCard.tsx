import { CircleHelp } from "lucide-react";

import { CATEGORY_ICONS_BY_NAME } from "@/lib/config";
import { formatCurrency } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface CategoryCardProps {
  categoryName: string;
  amount: number;
  count: number;
  percentage: number;
}

const CategoryCard = ({
  categoryName,
  amount,
  count,
  percentage,
}: CategoryCardProps) => {
  const IconComponent = CATEGORY_ICONS_BY_NAME[categoryName] || CircleHelp;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
          <IconComponent className="mr-2 h-4 w-4" />
          <span className="truncate">{categoryName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold">{formatCurrency(amount)}</span>
            <span className="text-muted-foreground text-xs">{count}</span>
          </div>

          {/* Simple bar chart */}
          <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-muted-foreground text-xs">
            {Math.round(percentage)}% of highest
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
