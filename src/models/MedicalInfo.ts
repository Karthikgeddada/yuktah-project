
/**
 * Medical Info Model
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMedicalInfo extends Document {
  userId: Types.ObjectId;
  fullName: string;
  birthYear: string;
  age: string;
  dob: string;
  weight: string;
  bodyCondition: string;
  badHabits: string;
  hasPastSurgery: boolean;
  surgery1Name: string;
  surgery1Date: string;
  surgery2Name: string;
  surgery2Date: string;
  surgery3Name: string;
  surgery3Date: string;
  bloodGroup: string;
  bloodGroupOther: string;
  allergies: string;
  allergiesOther: string;
  medications: string;
  medicationsOther: string;
  emergencyContact: string;
  chronicConditions: string;
  medicalNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

const medicalInfoSchema = new Schema<IMedicalInfo>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: { type: String, default: '' },
    birthYear: { type: String, default: '' },
    age: { type: String, default: '' },
    dob: { type: String, default: '' },
    weight: { type: String, default: '' },
    bodyCondition: { type: String, default: '' },
    badHabits: { type: String, default: '' },
    hasPastSurgery: { type: Boolean, default: false },
    surgery1Name: { type: String, default: '' },
    surgery1Date: { type: String, default: '' },
    surgery2Name: { type: String, default: '' },
    surgery2Date: { type: String, default: '' },
    surgery3Name: { type: String, default: '' },
    surgery3Date: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    bloodGroupOther: { type: String, default: '' },
    allergies: { type: String, default: '' },
    allergiesOther: { type: String, default: '' },
    medications: { type: String, default: '' },
    medicationsOther: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    chronicConditions: { type: String, default: '' },
    medicalNotes: { type: String, default: '' },
  },
  {
    timestamps: true,
    strict: false // Allow fields not in schema to be saved if needed, but we have them all
  }
);

// RE-INITIALIZATION TRICK: This ensures the model is ALWAYS recreated with the latest schema
if (mongoose.models && mongoose.models.MedicalInfo) {
  delete mongoose.models.MedicalInfo;
}

export default mongoose.model<IMedicalInfo>('MedicalInfo', medicalInfoSchema);
