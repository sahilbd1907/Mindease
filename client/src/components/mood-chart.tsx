import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { CheckIn } from '@shared/schema';

Chart.register(...registerables);

interface MoodChartProps {
  checkIns: CheckIn[];
  className?: string;
}

export default function MoodChart({ checkIns, className }: MoodChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !checkIns.length) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Prepare data (last 7 days)
    const last7Days = checkIns.slice(-7);
    const labels = last7Days.map(checkIn => 
      new Date(checkIn.timestamp!).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    );
    const moodData = last7Days.map(checkIn => checkIn.mood);
    const stressData = last7Days.map(checkIn => checkIn.stressLevel);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Mood Score',
            data: moodData,
            borderColor: 'hsl(207, 90%, 54%)',
            backgroundColor: 'hsla(207, 90%, 54%, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Stress Level',
            data: stressData,
            borderColor: 'hsl(25, 95%, 53%)',
            backgroundColor: 'hsla(25, 95%, 53%, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: 'hsl(25, 5.3%, 44.7%)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'hsl(25, 5.3%, 44.7%)'
            }
          }
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6
          }
        }
      }
    };

    chartRef.current = new Chart(ctx, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [checkIns]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} />
    </div>
  );
}
