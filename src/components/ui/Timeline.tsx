import { useMemo } from "react";
import { HabitWithCompletedDates } from "../../types/habit";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface TimelineProps {
  habits: HabitWithCompletedDates[];
  timeRange: 'week' | 'month' | 'year';
}

interface ChartDataPoint {
  label: string;
  completion: number;
  isToday: boolean;
}

interface DotProps {
  cx: number;
  cy: number;
  payload: {
    isToday?: boolean;
  };
}

export const Timeline = ({ habits, timeRange }: TimelineProps) => {
  const getEmoji = (percentage: number): string => {
    if (percentage >= 80) return '🌟';
    if (percentage >= 60) return '✨';
    if (percentage >= 40) return '💪';
    return '🌱';
  };

  const timeRangeData = useMemo(() => {
    const today = new Date();
    const dates: Date[] = [];
    const labels: string[] = [];
    
    if (timeRange === 'week') {
      // Get Monday of current week
      const monday = new Date(today);
      monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
      monday.setHours(0, 0, 0, 0);

      // Generate dates for the whole week
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date);
        const isToday = date.toDateString() === new Date().toDateString();
        labels.push(isToday ? 'Today' : date.toLocaleDateString('default', { weekday: 'short' }));
      }
    } else if (timeRange === 'month') {
      // Get current month's weeks
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const numWeeks = Math.ceil((today.getDate() + firstDay.getDay()) / 7);

      for (let i = 0; i < numWeeks; i++) {
        const weekStart = new Date(firstDay);
        weekStart.setDate(1 + (i * 7));
        dates.push(weekStart);
        labels.push(`Week ${i + 1}`);
      }
    } else {
      // Year view - last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        dates.push(date);
        labels.push(date.toLocaleString('default', { month: 'short' }));
      }
    }
    
    return { dates, labels };
  }, [timeRange]);

  const chartData = useMemo(() => {
    const stats = timeRangeData.dates.map((date: Date, index: number) => {
      let totalPossibleCompletions = 0;
      let actualCompletions = 0;

      habits.forEach(habit => {
        const startOfPeriod = new Date(date);
        const endOfPeriod = new Date(date);
        
        if (timeRange === 'week') {
          // Single day
          startOfPeriod.setHours(0, 0, 0, 0);
          endOfPeriod.setHours(23, 59, 59, 999);
          totalPossibleCompletions += 1;
        } else if (timeRange === 'month') {
          // Week period
          endOfPeriod.setDate(endOfPeriod.getDate() + 6);
          totalPossibleCompletions += 7;
        } else {
          // Month period
          endOfPeriod.setMonth(endOfPeriod.getMonth() + 1);
          endOfPeriod.setDate(0);
          totalPossibleCompletions += endOfPeriod.getDate();
        }

        habit.completedDates.forEach((completionDate: string) => {
          const completion = new Date(completionDate);
          if (completion >= startOfPeriod && completion <= endOfPeriod) {
            actualCompletions++;
          }
        });
      });

      const percentage = totalPossibleCompletions > 0 
        ? Math.round((actualCompletions / totalPossibleCompletions) * 100)
        : 0;

      return {
        label: timeRangeData.labels[index],
        completion: percentage,
        isToday: timeRange === 'week' && timeRangeData.labels[index].includes('Today')
      } as ChartDataPoint;
    });

    return stats;
  }, [habits, timeRange, timeRangeData]);

  return (
    <div className="h-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData} 
          margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
        >
          <XAxis 
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={({ x, y, payload }: { x: number; y: number; payload: { value: string; payload?: { isToday?: boolean } } }) => {
              const isToday = payload.payload?.isToday;
              return (
                <text
                  x={x}
                  y={y + 10}
                  fill={isToday ? 'rgb(52 211 153)' : 'rgb(255 255 255 / 0.7)'}
                  fontSize={10}
                  textAnchor="middle"
                  fontWeight={isToday ? 500 : 400}
                >
                  {isToday ? '✨ Today' : payload.value}
                </text>
              );
            }}
          />
          <YAxis 
            hide={true}
            domain={[0, 100]}
          />
          <Tooltip 
            content={(props: any) => {
              const { active, payload } = props;
              if (active && payload && payload.length) {
                const percentage = Number(payload[0].value);
                return (
                  <div className="rounded-lg border border-emerald-800/50 bg-green-950/90 px-3 py-2 shadow-xl">
                    <div className="text-[10px] font-medium text-emerald-400 flex flex-col items-center gap-1">
                      <span>{getEmoji(percentage)}</span>
                      <span>{percentage}%</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="completion"
            stroke="rgb(16 185 129 / 0.7)"
            strokeWidth={2}
            isAnimationActive={false}
            label={{
              position: 'top',
              fill: 'rgb(255 255 255 / 0.7)',
              fontSize: 10,
              formatter: (value: number) => `${value}%`,
              dy: -8
            }}
            dot={(props: DotProps) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={payload.isToday ? 5 : 4}
                  fill={payload.isToday ? "rgb(52 211 153)" : "rgb(16 185 129)"}
                  strokeWidth={0}
                />
              );
            }}
            activeDot={{
              r: 6,
              fill: "rgb(16 185 129)",
              strokeWidth: 0
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
