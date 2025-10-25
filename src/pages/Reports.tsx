import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Report {
  id: string;
  issue_type: string;
  description: string;
  image_url: string | null;
  location_address: string | null;
  threat_level: "high" | "medium" | "low";
  created_at: string;
}

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-threat-high text-white";
      case "medium":
        return "bg-threat-medium text-white";
      case "low":
        return "bg-threat-low text-white";
      default:
        return "bg-secondary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-civic flex items-center justify-center">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-civic">
      <div className="container-civic py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Report Form
        </Button>

        <h1 className="text-4xl font-bold mb-8 text-center">Submitted Reports</h1>

        {reports.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No reports submitted yet.</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.id} className="overflow-hidden hover:shadow-elegant transition-shadow">
                <div className="grid md:grid-cols-1 gap-4 p-6">
                  {/* Image Section */}
                  {report.image_url && (
                    <div className="w-full h-48 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={report.image_url}
                        alt="Report"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Details Section */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg capitalize">
                        {report.issue_type.replace("-", " ")}
                      </h3>
                      <Badge className={getThreatColor(report.threat_level)}>
                        {report.threat_level} risk
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {report.description}
                    </p>

                    {report.location_address && (
                      <div className="text-sm">
                        <span className="font-medium">Location:</span>
                        <p className="text-muted-foreground mt-1">
                          {report.location_address}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      <span className="font-medium">Submitted:</span>{" "}
                      {new Date(report.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
