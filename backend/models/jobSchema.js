import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title."],
    minLength: [3, "Title must contain at least 3 characters!"],
    maxLength: [30, "Title cannot exceed 30 characters!"],
  },
  description: {
    type: String,
    required: [true, "Please provide description."],
    minLength: [30, "Description must contain at least 30 characters!"],
    maxLength: [500, "Description cannot exceed 500 characters!"],
  },
  category: {
    type: String,
    required: [true, "Please provide a category."],
  },
  country: {
    type: String,
    required: [true, "Please provide a country name."],
  },
  city: {
    type: String,
    required: [true, "Please provide a city name."],
  },
  location: {
    type: String,
    required: [true, "Please provide location."],
    minLength: [20, "Location must contain at least 20 characters!"],
  },
  fixedSalary: {
    type: Number,
    min: [1000, "Fixed salary must be at least 4 digits."],
    max: [999999999, "Fixed salary cannot exceed 9 digits."],
  },
  salaryFrom: {
    type: Number,
    min: [1000, "Salary From must be at least 4 digits."],
    max: [999999999, "Salary From cannot exceed 9 digits."],
  },
  salaryTo: {
    type: Number,
    min: [1000, "Salary To must be at least 4 digits."],
    max: [999999999, "Salary To cannot exceed 9 digits."],
  },
  expired: {
    type: Boolean,
    default: false,
  },
  jobPostedOn: {
    type: Date,
    default: Date.now,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  skillsRequired: {
    type: [String],
    default: [],
    validate: {
      validator: (arr) => arr.every(skill => typeof skill === "string"),
      message: "Each skill must be a string.",
    },
  },
});

export const Job = mongoose.model("Job", jobSchema);
