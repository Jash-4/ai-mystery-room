import mongoose from 'mongoose';

const SuspectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String, required: true },
    alibi: { type: String, required: true },
    motive: { type: String, required: true },
  },
  { _id: false }
);

const ClueSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    discovered: { type: Boolean, default: false },
  },
  { _id: false }
);

const HintSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    used: { type: Boolean, default: false },
  },
  { _id: false }
);

const AccusationSchema = new mongoose.Schema(
  {
    accusedSuspectId: { type: String },
    reason: { type: String },
    isCorrect: { type: Boolean },
    submittedAt: { type: Date },
  },
  { _id: false }
);

const CaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    premise: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
      default: 'medium',
    },
    suspects: {
      type: [SuspectSchema],
      required: true,
      validate: [v => Array.isArray(v) && v.length > 0, 'At least one suspect is required'],
    },
    clues: {
      type: [ClueSchema],
      required: true,
      validate: [v => Array.isArray(v) && v.length > 0, 'At least one clue is required'],
    },
    hints: {
      type: [HintSchema],
      default: [],
    },
    culpritId: {
      type: String,
      required: true,
      select: false, // Hidden from normal queries for anti-cheat security
    },
    solutionExplanation: {
      type: String,
      required: true,
      select: false, // Hidden from normal queries for anti-cheat security
    },
    accusation: {
      type: AccusationSchema,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['investigating', 'solved', 'failed'],
      default: 'investigating',
    },
  },
  {
    timestamps: true,
  }
);

// Method to format public case object (guaranteeing secrecy)
CaseSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  if (obj.status === 'investigating') {
    delete obj.culpritId;
    delete obj.solutionExplanation;
  }
  return obj;
};

const Case = mongoose.model('Case', CaseSchema);

export default Case;
