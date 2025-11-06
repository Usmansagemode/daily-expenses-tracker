import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { MEMBER_CHART_COLORS } from "@/lib/config";
import { formatCurrency } from "@/lib/utils";

import { Card, CardContent } from "../ui/card";

interface MemberTotal {
  id: string;
  name: string;
  amount: number;
  count: number;
}

interface MemberCardProps {
  memberTotals: MemberTotal[];
}

const MemberCard = ({ memberTotals }: MemberCardProps) => {
  if (memberTotals.length === 0) return null;

  const totalAmount = memberTotals.reduce(
    (sum, member) => sum + member.amount,
    0,
  );

  const pieChartData = memberTotals.map((member, index) => ({
    amount: member.amount,
    count: member.count,
    fill: MEMBER_CHART_COLORS[index % MEMBER_CHART_COLORS.length],
    name: member.name,
    percentage:
      totalAmount > 0 ? Math.round((member.amount / totalAmount) * 100) : 0,
  }));

  return (
    <Card className="col-span-2 h-fit sm:col-span-2 md:col-span-2 lg:col-span-2">
      <CardContent className="pt-0">
        <div className="flex items-center justify-evenly space-y-3">
          {/* Compact Pie Chart */}
          <div className="flex justify-center">
            <div className="h-26 w-26">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={1}
                    dataKey="amount"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            {/* Member List with Color Indicators */}
            <div className="space-y-2">
              {memberTotals.slice(0, 4).map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: pieChartData[index]?.fill || "#ccc",
                      }}
                    />
                    <span className="truncate text-sm">{member.name}</span>
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    <div className="text-sm font-semibold">
                      {formatCurrency(member.amount)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Show "and X more" if there are more than 4 members */}
              {memberTotals.length > 4 && (
                <div className="pt-1 text-center">
                  <span className="text-muted-foreground text-xs">
                    and {memberTotals.length - 4} more
                  </span>
                </div>
              )}
            </div>

            {/* Total Summary */}
            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-bold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberCard;

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      amount: number;
      percentage: number;
      count: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border-border w-[12vw] rounded-lg border p-3 shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-muted-foreground text-sm">
          Amount:{" "}
          <span className="font-medium">{formatCurrency(data.amount)}</span>
        </p>
        <p className="text-muted-foreground text-sm">
          {data.percentage}% of total
        </p>
        <p className="text-muted-foreground text-sm">
          {data.count} {data.count === 1 ? "expense" : "expenses"}
        </p>
      </div>
    );
  }
  return null;
};
