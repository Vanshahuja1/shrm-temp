import Candidate from '../models/candidateModel.js';
// const Candidate = require('../models/candidateModel.js');
// Create a new candidate
export const createCandidate = async (req, res) => {
  try {
    const candidate = new Candidate(req.body);
    await candidate.save();
    res.status(201).json(candidate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all candidates
export const getAllCandidates = async (req, res) => {
  try {
    // Copy all query params to use directly as filter
    const query = { ...req.query };

    // Optional: handle special cases, e.g., regex for partial search on some fields
    if (query.name) {
      query.name = { $regex: new RegExp(query.name, 'i') };
    }
    if (query.jobTitle) {
      query.jobTitle = { $regex: new RegExp(query.jobTitle, 'i') };
    }

    // Optional: handle date fields if passed
    if (query.appliedDate) {
      // Support exact date or range (e.g., ?appliedDate[gte]=2025-07-01&appliedDate[lte]=2025-07-31)
      if (typeof query.appliedDate === 'object') {
        const dateQuery = {};
        if (query.appliedDate.gte) dateQuery.$gte = new Date(query.appliedDate.gte);
        if (query.appliedDate.lte) dateQuery.$lte = new Date(query.appliedDate.lte);
        query.appliedDate = dateQuery;
      } else {
        query.appliedDate = new Date(query.appliedDate);
      }
    }

    // Fetch candidates using dynamic query
    const candidates = await Candidate.find(query)
      
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single candidate by ID
export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update candidate by ID
export const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete candidate by ID
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Schedule interview for candidate
export const scheduleInterview = async (req, res) => {
  try {
    const { scheduledDate, interviewer } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    candidate.interviewScheduled = {
      isScheduled: true,
      scheduledDate,
      interviewer
    };
    await candidate.save();
    res.json({ message: 'Interview scheduled successfully', candidate });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
