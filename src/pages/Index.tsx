import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, Upload, MapPin, AlertCircle, Zap, Droplets, Construction } from "lucide-react";

const Index = () => {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueType || !description || !image || !location) {
      toast.error("Please fill in all fields and capture your location");
      return;
    }

    // In a real app, this would submit to a backend
    const reportData = {
      issueType,
      description,
      image: image.name,
      location,
      timestamp: new Date().toISOString(),
    };

    console.log("Report submitted:", reportData);
    toast.success("Report submitted successfully! Authorities will be notified.");
    
    // Reset form
    setIssueType("");
    setDescription("");
    setImage(null);
    setImagePreview("");
    setLocation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          Report Public Infrastructure Issues
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Help improve your community by reporting potholes, electrical problems, sewage issues, and other infrastructure damage.
        </p>
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
              >
                Submit Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
