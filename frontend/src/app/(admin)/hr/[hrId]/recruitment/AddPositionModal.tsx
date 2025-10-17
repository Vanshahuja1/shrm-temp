import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axios from "axios";

interface AddPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PositionFormData {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salaryRange: {
    min: string;
    max: string;
  };
  description: string;
  requirements: string;
  benefits: string;
  applicationDeadline: Date | undefined;
  numberOfOpenings: string;
}

const departments = [
  "IT",
  "Marketing", 
  "HR",
  "Accounts",
  "Operations",
  "Analytics",
  "Sales",
  "Other"
];

const employmentTypes = [
  "Full-time",
  "Part-time", 
  "Contract",
  "Internship",
  "Freelance"
];

const experienceLevels = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Lead/Manager",
  "Director/VP"
];

const AddPositionModal: React.FC<AddPositionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<PositionFormData>({
    title: "",
    department: "",
    location: "",
    employmentType: "",
    experienceLevel: "",
    salaryRange: {
      min: "",
      max: ""
    },
    description: "",
    requirements: "",
    benefits: "",
    applicationDeadline: undefined,
    numberOfOpenings: "1"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.employmentType) {
      newErrors.employmentType = "Employment type is required";
    }

    if (!formData.experienceLevel) {
      newErrors.experienceLevel = "Experience level is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = "Requirements are required";
    }

    if (!formData.numberOfOpenings || parseInt(formData.numberOfOpenings) < 1) {
      newErrors.numberOfOpenings = "Number of openings must be at least 1";
    }

    if (formData.salaryRange.min && formData.salaryRange.max) {
      const minSalary = parseInt(formData.salaryRange.min);
      const maxSalary = parseInt(formData.salaryRange.max);
      
      if (minSalary >= maxSalary) {
        newErrors.salaryRange = "Maximum salary must be greater than minimum salary";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const positionData = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        salaryRange: {
          min: formData.salaryRange.min ? parseInt(formData.salaryRange.min) : null,
          max: formData.salaryRange.max ? parseInt(formData.salaryRange.max) : null
        },
        description: formData.description,
        requirements: formData.requirements.split('\n').filter(req => req.trim()),
        benefits: formData.benefits.split('\n').filter(benefit => benefit.trim()),
        applicationDeadline: formData.applicationDeadline?.toISOString(),
        numberOfOpenings: parseInt(formData.numberOfOpenings),
        status: "Active",
        postedDate: new Date().toISOString()
      };

      await axios.post("/recruitment/positions", positionData);
      
      // Reset form
      setFormData({
        title: "",
        department: "",
        location: "",
        employmentType: "",
        experienceLevel: "",
        salaryRange: { min: "", max: "" },
        description: "",
        requirements: "",
        benefits: "",
        applicationDeadline: undefined,
        numberOfOpenings: "1"
      });
      
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating position:", error);
      setErrors({ submit: "Failed to create position. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof PositionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSalaryChange = (type: 'min' | 'max', value: string) => {
    setFormData(prev => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        [type]: value
      }
    }));
    
    if (errors.salaryRange) {
      setErrors(prev => ({ ...prev, salaryRange: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Position</DialogTitle>
          <DialogDescription>
            Create a new job position to start receiving applications.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g. Frontend Developer"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange("department", value)}
              >
                <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g. Nagpur, Remote"
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfOpenings">Number of Openings *</Label>
              <Input
                id="numberOfOpenings"
                type="number"
                min="1"
                value={formData.numberOfOpenings}
                onChange={(e) => handleInputChange("numberOfOpenings", e.target.value)}
                className={errors.numberOfOpenings ? "border-red-500" : ""}
              />
              {errors.numberOfOpenings && <p className="text-sm text-red-500">{errors.numberOfOpenings}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type *</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value) => handleInputChange("employmentType", value)}
              >
                <SelectTrigger className={errors.employmentType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {employmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employmentType && <p className="text-sm text-red-500">{errors.employmentType}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level *</Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) => handleInputChange("experienceLevel", value)}
              >
                <SelectTrigger className={errors.experienceLevel ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.experienceLevel && <p className="text-sm text-red-500">{errors.experienceLevel}</p>}
            </div>
          </div>

          {/* Salary Range */}
          <div className="space-y-2">
            <Label>Salary Range (Optional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  placeholder="Min salary"
                  value={formData.salaryRange.min}
                  onChange={(e) => handleSalaryChange("min", e.target.value)}
                  className={errors.salaryRange ? "border-red-500" : ""}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max salary"
                  value={formData.salaryRange.max}
                  onChange={(e) => handleSalaryChange("max", e.target.value)}
                  className={errors.salaryRange ? "border-red-500" : ""}
                />
              </div>
            </div>
            {errors.salaryRange && <p className="text-sm text-red-500">{errors.salaryRange}</p>}
          </div>

          {/* Application Deadline */}
          <div className="space-y-2">
            <Label>Application Deadline (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.applicationDeadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.applicationDeadline ? (
                    format(formData.applicationDeadline, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.applicationDeadline}
                  onSelect={(date) => setFormData(prev => ({ ...prev, applicationDeadline: date }))}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements *</Label>
            <Textarea
              id="requirements"
              rows={4}
              value={formData.requirements}
              onChange={(e) => handleInputChange("requirements", e.target.value)}
              placeholder="List the required skills, experience, and qualifications (one per line)..."
              className={errors.requirements ? "border-red-500" : ""}
            />
            {errors.requirements && <p className="text-sm text-red-500">{errors.requirements}</p>}
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits (Optional)</Label>
            <Textarea
              id="benefits"
              rows={3}
              value={formData.benefits}
              onChange={(e) => handleInputChange("benefits", e.target.value)}
              placeholder="List the benefits and perks (one per line)..."
            />
          </div>

          {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Position"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPositionModal;