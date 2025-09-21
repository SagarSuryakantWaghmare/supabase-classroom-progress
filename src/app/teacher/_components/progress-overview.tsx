import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "Jan", average: 75, highest: 90, lowest: 60 },
  { name: "Feb", average: 78, highest: 92, lowest: 65 },
  { name: "Mar", average: 82, highest: 95, lowest: 70 },
  { name: "Apr", average: 85, highest: 98, lowest: 72 },
  { name: "May", average: 80, highest: 94, lowest: 68 },
  { name: "Jun", average: 88, highest: 96, lowest: 75 },
];

export function ProgressOverview() {
  return (
    <Card className="bg-orange-900/10 border-orange-800/50">
      <CardHeader>
        <CardTitle className="text-xl text-orange-200">Class Performance</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#f97316"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#f97316"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  borderColor: 'rgba(251, 146, 60, 0.5)',
                  borderRadius: '0.5rem',
                }}
                itemStyle={{ color: '#fef3c7' }}
                labelStyle={{ color: '#fdba74' }}
              />
              <Legend />
              <Bar
                dataKey="average"
                name="Class Average"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="highest"
                name="Highest Score"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="lowest"
                name="Lowest Score"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
