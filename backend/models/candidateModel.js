import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    appliedDate: { type: Date },
    screeningScore: { type: Number },
    interviewScheduled: {
      isScheduled: { type: Boolean, default: false },
      scheduledDate: { type: Date },
      interviewer: {
        id: { type: String },
        name: { type: String },
      },
    },
    source: { type: String },
    portfolio: { type: String },
    location: { type: String },
    currentCompany: { type: String },
    jobTitle: { type: String },
    department  : { 
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
      name: { type: String },
     },
    shortlisted: { type: Boolean, default: false },
    status: { type: String },
    recruiterAssigned: {
      isAssigned: { type: Boolean, default: false },
      interviewer: {
        id: { type: String },
        name: { type: String },
      },
    },
    notes: { type: String },
    resume: { type: String },
    expectedSalary: { type: String },
  },
  { timestamps: true }
);

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;
