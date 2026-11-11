import BarChart from "./BarChart";
import { data } from "./data";

function App() {
  return (
    <div style={{ padding: 40}}>
      <h1>Students in the first D3 + React Cohort</h1>
      <div style={{ padding: 20}}>
      <BarChart data={data} />
    </div>
    </div>
  );
}

export default App;
