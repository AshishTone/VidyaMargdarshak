import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function StreamScoreChart({ scores }) {
  const labels = Object.keys(scores || {});
  const values = Object.values(scores || {});

  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: "Fit score",
            data: values,
            backgroundColor: ["#1e3a8a", "#60a5fa", "#10b981", "#94a3b8"],
            borderRadius: 12,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20 },
          },
        },
      }}
    />
  );
}
