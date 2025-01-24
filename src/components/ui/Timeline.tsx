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
      // Get current month's start and end
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      firstDay.setHours(0, 0, 0, 0);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      lastDay.setHours(23, 59, 59, 999);
      
      let currentDate = new Date(firstDay);
      let weekNumber = 1;
      
      // Generate weeks for the current month only
      while (currentDate <= lastDay) {
        const weekStart = new Date(currentDate);
        weekStart.setHours(0, 0, 0, 0);
        
        // For first week, start from 1st of month
        // For other weeks, start from Monday
        if (weekNumber === 1) {
          dates.push(weekStart);
        } else {
          const monday = new Date(currentDate);
          monday.setDate(currentDate.getDate() - (currentDate.getDay() - 1));
          monday.setHours(0, 0, 0, 0);
          dates.push(monday);
        }
        
        labels.push(`Week ${weekNumber}`);
        
        // Move to next week
        if (weekNumber === 1) {
          // First week: move to next Monday
          currentDate.setDate(6); // Move to 6th (first Sunday)
          currentDate.setDate(currentDate.getDate() + 1); // Move to Monday
        } else {
          currentDate.setDate(currentDate.getDate() + 7);
        }
        
        if (currentDate > lastDay) break;
        weekNumber++;
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = timeRangeData.dates.map((date: Date, index: number) => {
      let totalPossibleCompletions = 0;
      let actualCompletions = 0;

      console.log(`Processing week ${index + 1}, starting ${date.toISOString()}`);

      // Calculate week end date first
      const weekEnd = new Date(date);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      
      if (timeRange === 'month') {
        // Set week boundaries
        weekEnd.setDate(weekEnd.getDate() + 6); // Add 6 days to get to end of week
        
        // Ensure we don't go past month end
        if (weekEnd > monthEnd) {
          weekEnd.setTime(monthEnd.getTime());
        }
        
        // Set time to end of day
        weekEnd.setHours(23, 59, 59, 999);
      }

      if (timeRange === 'week') {
        habits.forEach(habit => {
          const habitStartDate = new Date(habit.created_at);
          habitStartDate.setHours(0, 0, 0, 0);
          
          // Skip if the date is before habit start
          if (date < habitStartDate) {
            return;
          }

          // For daily habits, count 1 completion per habit if the date is today or before
          if (habit.frequency === 'daily' && date <= today) {
            totalPossibleCompletions += 1;
          }
          
          // Count completions for this specific day only
          const completionsForDay = habit.completedDates.filter(completionDate => {
            const completion = new Date(completionDate);
            completion.setHours(0, 0, 0, 0);
            return completion.getTime() === date.getTime();
          }).length;
          
          actualCompletions += completionsForDay;
        });
      } else if (timeRange === 'month') {
        habits.forEach(habit => {
          const habitStartDate = new Date(habit.created_at);
          habitStartDate.setHours(0, 0, 0, 0);
          
          // Skip if the entire week is before habit start
          if (weekEnd < habitStartDate) {
            console.log(`Skipping week - ends before habit start date ${habitStartDate.toISOString()}`);
            return;
          }

          // Only count days from habit start to week end
          const effectiveStart = habitStartDate > date ? habitStartDate : date;
          const effectiveEnd = weekEnd > today ? today : weekEnd;
          
          // Normalize dates to start of day for comparison
          const normalizedStart = new Date(effectiveStart);
          const normalizedEnd = new Date(weekEnd); // Use weekEnd instead of effectiveEnd
          normalizedStart.setHours(0, 0, 0, 0);
          normalizedEnd.setHours(23, 59, 59, 999);
          
          console.log(`Week ${index + 1} bounds:`, {
            weekStart: date.toISOString(),
            weekEnd: weekEnd.toISOString(),
            effectiveStart: normalizedStart.toISOString(),
            effectiveEnd: normalizedEnd.toISOString(),
            habitStartDate: habitStartDate.toISOString()
          });

          if (normalizedEnd >= normalizedStart) {
            // Calculate days from habit start to week end
            const daysInPeriod = Math.floor((normalizedEnd.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            
            if (habit.frequency === 'daily') {
              totalPossibleCompletions += daysInPeriod;
            }
            
            // Only count completions up to today
            const completionsInWeek = habit.completedDates.filter(completionDate => {
              const completion = new Date(completionDate);
              completion.setHours(0, 0, 0, 0);
              return completion.getTime() >= normalizedStart.getTime() && completion.getTime() <= effectiveEnd.getTime();
            }).length;
            
            actualCompletions += completionsInWeek;

            console.log(`Week ${index + 1} calculations:`, {
              daysInPeriod,
              totalPossibleCompletions,
              completionsInWeek,
              actualCompletions,
              habitStartDate: habitStartDate.toISOString()
            });
          }
        });
      } else if (timeRange === 'year') {
        habits.forEach(habit => {
          const habitStartDate = new Date(habit.created_at);
          habitStartDate.setHours(0, 0, 0, 0);
          
          // Get the month's start and end dates
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);
          
          // Skip if the entire month is before habit start
          if (monthEnd < habitStartDate) {
            return;
          }

          // Only count days from habit start to month end
          const effectiveStart = habitStartDate > monthStart ? habitStartDate : monthStart;
          const effectiveEnd = monthEnd > today ? today : monthEnd;
          
          // Skip future months
          if (monthStart > today) {
            return;
          }

          if (effectiveEnd >= effectiveStart) {
            const daysInPeriod = Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            
            if (habit.frequency === 'daily') {
              // For daily habits, count remaining days in the month
              const daysRemaining = Math.floor((monthEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              totalPossibleCompletions += daysRemaining;
            } else if (habit.frequency === 'weekly') {
              // For weekly habits, count remaining weeks
              totalPossibleCompletions += Math.ceil(daysInPeriod / 7);
            } else if (habit.frequency === 'monthly') {
              // For monthly habits, count as 1 if we're past the 15th
              totalPossibleCompletions += 1;
            }
            
            // Count completions for this month
            const completionsInMonth = habit.completedDates.filter(completionDate => {
              const completion = new Date(completionDate);
              completion.setHours(0, 0, 0, 0);
              return completion >= effectiveStart && completion <= effectiveEnd;
            }).length;
            
            actualCompletions += completionsInMonth;
          }
        });
      }

      const percentage = totalPossibleCompletions > 0 
        ? Math.round((actualCompletions / totalPossibleCompletions) * 100)
        : 0;

      console.log(`Final percentage for ${timeRangeData.labels[index]}: ${percentage}%`, {
        totalPossibleCompletions,
        actualCompletions
      });

      return {
        label: timeRangeData.labels[index],
        completion: percentage,
        isToday: timeRange === 'week' && timeRangeData.labels[index].includes('Today')
      } as ChartDataPoint;
    });

    console.log('Final chart data:', stats);

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
            tickFormatter={(value: number) => `${value}%`}
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
                      <span>{percentage}% completed</span>
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
              // Return an empty group if coordinates are missing
              if (!cx || !cy) return <g />;
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
              stroke: "rgb(16 185 129 / 0.3)",
              strokeWidth: 4
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
