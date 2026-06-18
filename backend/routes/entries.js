const express = require('express');
const router = express.Router();
const CarbonEntry = require('../models/CarbonEntry');
const { protect } = require('../middleware/auth');

// All routes require auth
router.use(protect);

// @route POST /api/entries - Create new entry
router.post('/', async (req, res) => {
  try {
    const entry = await CarbonEntry.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/entries - Get all entries for user
router.get('/', async (req, res) => {
  try {
    const { limit = 30, page = 1, startDate, endDate } = req.query;
    const filter = { user: req.user._id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const entries = await CarbonEntry.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await CarbonEntry.countDocuments(filter);

    res.json({ success: true, count: entries.length, total, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/entries/stats - Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    // Last 30 days trend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEntries = await CarbonEntry.find({
      user: userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    // Monthly aggregation (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await CarbonEntry.aggregate([
      { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalEmissions: { $sum: '$totals.overall' },
          transportationTotal: { $sum: '$totals.transportation' },
          energyTotal: { $sum: '$totals.energy' },
          lifestyleTotal: { $sum: '$totals.lifestyle' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Overall totals
    const allTimeStats = await CarbonEntry.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalEmissions: { $sum: '$totals.overall' },
          avgEmissions: { $avg: '$totals.overall' },
          entryCount: { $sum: 1 },
          maxEmission: { $max: '$totals.overall' },
          minEmission: { $min: '$totals.overall' }
        }
      }
    ]);

    // Category breakdown (all time)
    const categoryBreakdown = await CarbonEntry.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          transportation: { $sum: '$totals.transportation' },
          energy: { $sum: '$totals.energy' },
          lifestyle: { $sum: '$totals.lifestyle' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        recentEntries,
        monthlyStats,
        allTime: allTimeStats[0] || {},
        categoryBreakdown: categoryBreakdown[0] || {}
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/entries/recommendations - Get eco recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const recentEntry = await CarbonEntry.findOne({ user: req.user._id }).sort({ date: -1 });

    if (!recentEntry) {
      return res.json({ success: true, data: getDefaultRecommendations() });
    }

    const recommendations = generateRecommendations(recentEntry);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/entries/:id - Get single entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await CarbonEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/entries/:id - Update entry
router.put('/:id', async (req, res) => {
  try {
    let entry = await CarbonEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    Object.assign(entry, req.body);
    await entry.save();
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/entries/:id - Delete entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await CarbonEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper: generate personalized recommendations
function generateRecommendations(entry) {
  const recommendations = [];
  const t = entry.totals;

  if (t.transportation > 5) {
    recommendations.push({
      category: 'Transportation',
      icon: '🚌',
      impact: 'High',
      title: 'Switch to public transport',
      description: `Your transport emissions (${t.transportation.toFixed(1)} kg CO₂) are significant. Using buses or metro could reduce this by up to 70%.`,
      saving: (t.transportation * 0.7).toFixed(1)
    });
  }

  if (entry.transportation.car > 20) {
    recommendations.push({
      category: 'Transportation',
      icon: '🚲',
      impact: 'High',
      title: 'Cycle for short trips',
      description: 'For trips under 5km, cycling produces zero emissions and improves your health.',
      saving: (entry.transportation.car * 0.21 * 0.3).toFixed(1)
    });
  }

  if (t.energy > 3) {
    recommendations.push({
      category: 'Energy',
      icon: '💡',
      impact: 'Medium',
      title: 'Switch to LED lighting',
      description: `Your energy footprint is ${t.energy.toFixed(1)} kg CO₂. LED bulbs use 75% less energy than incandescent ones.`,
      saving: (t.energy * 0.2).toFixed(1)
    });
  }

  if (entry.energy.electricity > 10) {
    recommendations.push({
      category: 'Energy',
      icon: '☀️',
      impact: 'High',
      title: 'Consider solar panels',
      description: 'Rooftop solar can significantly reduce your electricity carbon footprint over time.',
      saving: (entry.energy.electricity * 0.82 * 0.8).toFixed(1)
    });
  }

  if (entry.lifestyle.meatMeals > 3) {
    recommendations.push({
      category: 'Diet',
      icon: '🥗',
      impact: 'Medium',
      title: 'Try Meatless Mondays',
      description: `Replacing ${Math.floor(entry.lifestyle.meatMeals / 2)} meat meals per week with vegetarian options saves significant emissions.`,
      saving: (entry.lifestyle.meatMeals * 0.5 * 2.8).toFixed(1)
    });
  }

  if (entry.lifestyle.wasteKg > 2) {
    recommendations.push({
      category: 'Waste',
      icon: '♻️',
      impact: 'Low',
      title: 'Start composting',
      description: 'Composting organic waste can reduce your waste emissions by 50% and enrich your garden.',
      saving: (entry.lifestyle.wasteKg * 0.5 * 0.5).toFixed(1)
    });
  }

  if (recommendations.length === 0) {
    recommendations.push(...getDefaultRecommendations());
  }

  return recommendations;
}

function getDefaultRecommendations() {
  return [
    { category: 'Transportation', icon: '🚶', impact: 'Medium', title: 'Walk short distances', description: 'Walking for trips under 1km contributes zero emissions and keeps you fit.', saving: '0.5' },
    { category: 'Energy', icon: '🔌', impact: 'Low', title: 'Unplug idle devices', description: 'Phantom power from idle electronics can account for 10% of home electricity use.', saving: '0.3' },
    { category: 'Diet', icon: '🌱', impact: 'Medium', title: 'Eat local produce', description: 'Local and seasonal food has a much lower transport carbon footprint.', saving: '0.8' }
  ];
}

module.exports = router;
