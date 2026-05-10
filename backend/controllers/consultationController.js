const TrainerConsult = require('../models/TrainerConsult');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorMiddleware');

exports.logConsultation = asyncHandler(async (req, res) => {
  const { trainerName, trainerSpecialization } = req.body;

  if (!trainerName || !trainerSpecialization) {
    res.status(400);
    throw new Error('Please provide trainer name and specialization');
  }

  const consultation = await TrainerConsult.create({
    userId: req.userId,
    trainerName,
    trainerSpecialization,
  });

  // Generate notification
  await Notification.create({
    userId: req.userId,
    title: 'Trainer Consulted',
    message: `You've initiated a session with ${trainerName}. Professional guidance is a great move!`,
    type: 'consultation'
  });

  console.log('💼 Trainer consultation saved to MongoDB for user:', req.userId);
  res.status(201).json(consultation);
});

exports.getConsultations = asyncHandler(async (req, res) => {
  const consultations = await TrainerConsult.find({ userId: req.userId }).sort({ consultedAt: -1 });
  res.json(consultations);
});
