import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, Upload, MapPin, AlertCircle, Zap, Droplets, Construction } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [threatLevel, setThreatLevel] = useState<"high" | "medium" | "low">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const issueTypes = [
    { value: "pothole", label: "Pothole", icon: AlertCircle },
    { value: "electric", label: "Electric Burnout", icon: Zap },
    { value: "sewage", label: "Sewage Issue", icon: Droplets },
    { value: "other", label: "Other Infrastructure", icon: Construction },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureLocation = () => {
    setIsCapturingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsCapturingLocation(false);
          toast.success("Location captured successfully!");
        },
        (error) => {
          setIsCapturingLocation(false);
          toast.error("Failed to get location. Please enable location services.");
          console.error(error);
        }
      );
    } else {
      setIsCapturingLocation(false);
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch (error) {
      console.error("Error fetching address:", error);
      return `${lat}, ${lng}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueType || !description || !image || !location) {
      toast.error("Please fill in all fields and capture your location");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload image
      const fileExt = image.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("report-images")
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("report-images")
        .getPublicUrl(fileName);

      imageUrl = publicUrl;

      // Get address
      const address = await getAddressFromCoords(location.lat, location.lng);

      // Insert report
      const { error: insertError } = await supabase.from("reports").insert({
        issue_type: issueType,
        description: description,
        image_url: imageUrl,
        location_lat: location.lat,
        location_lng: location.lng,
        location_address: address,
        threat_level: threatLevel,
      });

      if (insertError) throw insertError;

      toast.success("Report submitted successfully! Authorities will be notified.");
      
      // Reset form
      setIssueType("");
      setDescription("");
      setImage(null);
      setImagePreview("");
      setLocation(null);
      setThreatLevel("medium");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Report Public Infrastructure Issues
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Help improve your community by reporting potholes, electrical problems, sewage issues, and other infrastructure damage.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/reports")} className="mt-2">
            View All Reports
          </Button>
        </div>
      </header>

      {/* Report Form */}
      <main className="container mx-auto px-4 pb-16">
        <Card className="max-w-2xl mx-auto shadow-large">
          <CardHeader>
            <CardTitle className="text-2xl">Submit a Report</CardTitle>
            <CardDescription>
              Provide details about the infrastructure issue you've encountered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="issueType">Issue Type</Label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger id="issueType">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload/Capture */}
              <div className="space-y-2">
                <Label>Upload or Capture Image</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {imagePreview && (
                  <div className="mt-4 relative rounded-lg overflow-hidden shadow-medium">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Issue Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-32"
                />
              </div>

              {/* Threat Level */}
              <div className="space-y-2">
                <Label htmlFor="threatLevel">Threat Level</Label>
                <Select value={threatLevel} onValueChange={(value: "high" | "medium" | "low") => setThreatLevel(value)}>
                  <SelectTrigger id="threatLevel">
                    <SelectValue placeholder="Select threat level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Capture */}
              <div className="space-y-2">
                <Label>Location</Label>
                <Button
                  type="button"
                  variant={location ? "secondary" : "outline"}
                  className="w-full"
                  onClick={captureLocation}
                  disabled={isCapturingLocation}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {isCapturingLocation
                    ? "Capturing Location..."
                    : location
                    ? `Location Captured (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})`
                    : "Capture Current Location"}
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 shadow-medium"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting Report..." : "Submit Report"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
