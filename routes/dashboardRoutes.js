import { useEffect, useState } from "react";
import axios from "axios";

// Railway Production URL
const API_BASE_URL = "https://jpbcenterback-production.up.railway.app";

export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState({ jobs: 0, applications: 0, companies: 0, candidates: 0 });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // API Call-ஐ சரியாக அனுப்பவும்
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/stats`);
      
      // சர்வர் தரும் டேட்டாவை இங்குக் கையாளுங்கள்
      const data = res.data.data || res.data; 
      setDashboardStats({
        jobs: data.jobs || 0,
        applications: data.applications || 0,
        companies: data.companies || 0,
        candidates: data.candidates || 0,
      });
    } catch (error) {
      console.error("FETCH DASHBOARD ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ... (உங்கள் UI கோட் தொடரும்)
}