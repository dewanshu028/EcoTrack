const mongoose = require('mongoose');

const carbonEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Transportation (kg CO2)
  transportation: {
    car: { type: Number, default: 0 },        // km driven
    publicTransport: { type: Number, default: 0 }, // km
    flight: { type: Number, default: 0 },      // km
    motorcycle: { type: Number, default: 0 }   // km
  },
  // Energy (kWh)
  energy: {
    electricity: { type: Number, default: 0 },
    naturalGas: { type: Number, default: 0 },
    lpg: { type: Number, default: 0 }
  },
  // Lifestyle
  lifestyle: {
    meatMeals: { type: Number, default: 0 },     // meals/week
    vegetarianMeals: { type: Number, default: 0 },
    wasteKg: { type: Number, default: 0 }
  },
  // Calculated totals (kg CO2e)
  totals: {
    transportation: { type: Number, default: 0 },
    energy: { type: Number, default: 0 },
    lifestyle: { type: Number, default: 0 },
    overall: { type: Number, default: 0 }
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });

// Auto-calculate totals before save
carbonEntrySchema.pre('save', function(next) {
  // Emission factors
  const EF = {
    car: 0.21,            // kg CO2/km
    publicTransport: 0.089,
    flight: 0.255,
    motorcycle: 0.113,
    electricity: 0.82,    // kg CO2/kWh (India grid average)
    naturalGas: 2.0,      // kg CO2/cubic meter
    lpg: 1.51,            // kg CO2/litre
    meatMeal: 3.3,        // kg CO2/meal
    vegetarianMeal: 0.5,
    waste: 0.5            // kg CO2/kg waste
  };

  const t = this.transportation;
  const e = this.energy;
  const l = this.lifestyle;

  this.totals.transportation = (
    (t.car * EF.car) +
    (t.publicTransport * EF.publicTransport) +
    (t.flight * EF.flight) +
    (t.motorcycle * EF.motorcycle)
  );

  this.totals.energy = (
    (e.electricity * EF.electricity) +
    (e.naturalGas * EF.naturalGas) +
    (e.lpg * EF.lpg)
  );

  this.totals.lifestyle = (
    (l.meatMeals * EF.meatMeal) +
    (l.vegetarianMeals * EF.vegetarianMeal) +
    (l.wasteKg * EF.waste)
  );

  this.totals.overall = this.totals.transportation + this.totals.energy + this.totals.lifestyle;
  next();
});

module.exports = mongoose.model('CarbonEntry', carbonEntrySchema);
